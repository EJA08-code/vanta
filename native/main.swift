import Cocoa
import WebKit
import Security
import CryptoKit

/// The Notion key lives only in the macOS Keychain, never in journal.json or in the page.
enum NotionKey {
    static let service = "local.vanta.notion"
    static let account = "integration-secret"
    static var base: [String: Any] { [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: account] }
    static func get() -> String? {
        var q = base; q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: AnyObject?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data else { return nil }
        return String(data: d, encoding: .utf8)
    }
    @discardableResult static func set(_ key: String) -> Bool {
        SecItemDelete(base as CFDictionary)
        var q = base; q[kSecValueData as String] = Data(key.utf8); q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        return SecItemAdd(q as CFDictionary, nil) == errSecSuccess
    }
    static func forget() { SecItemDelete(base as CFDictionary) }
}

/// Everything Vanta may ask Notion. Writing is impossible by construction: only reads, plus the two
/// POST endpoints Notion uses for reading (search and query), are allowed through.
enum NotionGate {
    static let api = "https://api.notion.com"
    static let version = "2026-03-11"
    static func allows(method: String, path: String) -> Bool {
        let bare = path.split(separator: "?", maxSplits: 1, omittingEmptySubsequences: false).first.map(String.init) ?? path
        if bare.contains("..") || bare.contains("//") { return false }
        func matches(_ p: String) -> Bool { bare.range(of: p, options: .regularExpression) != nil }
        switch method {
        case "GET": return matches("^/v1/blocks/[0-9a-fA-F-]{32,36}/children$") || matches("^/v1/data_sources/[0-9a-fA-F-]{32,36}$") || bare == "/v1/users/me"
        case "POST": return bare == "/v1/search" || matches("^/v1/data_sources/[0-9a-fA-F-]{32,36}/query$")
        default: return false
        }
    }
}

/// Vanta for Mac: a small native window around vanta.html.
/// The journal lives in a plain journal.json the user owns, with one dated backup per day.
final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandlerWithReply, WKUIDelegate, WKNavigationDelegate, WKURLSchemeHandler {
    var window: NSWindow!
    var web: WKWebView!
    let io = DispatchQueue(label: "vanta.io")
    let folderKey = "dataFolder"
    var defaultDir: URL { FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Vanta") }
    var customDir: URL? { UserDefaults.standard.string(forKey: folderKey).map { URL(fileURLWithPath: $0) } }
    var dataDir: URL { customDir ?? defaultDir }
    var journal: URL { dataDir.appendingPathComponent("journal.json") }
    var imagesDir: URL { dataDir.appendingPathComponent("images") }
    static let imageRef = try! NSRegularExpression(pattern: "vanta-img://local/([0-9a-f]{64}\\.(?:jpg|png|gif|webp))")
    static let imageTypes = ["jpg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"]
    var liveImageTasks = Set<ObjectIdentifier>()

    // MARK: Screenshots as files
    /// Named by the SHA-256 of their bytes, so one image is only ever stored once and never changes.
    func saveImage(_ dataURL: String, in dir: URL) -> String? {
        guard dataURL.hasPrefix("data:image/"), let comma = dataURL.firstIndex(of: ",") else { return nil }
        let head = dataURL[..<comma]
        guard head.hasSuffix(";base64"), let d = Data(base64Encoded: String(dataURL[dataURL.index(after: comma)...])), !d.isEmpty else { return nil }
        let mime = String(head.dropFirst(5).dropLast(7))
        guard let ext = Self.imageTypes.first(where: { $0.value == mime })?.key else { return nil }
        let name = SHA256.hash(data: d).map { String(format: "%02x", $0) }.joined() + "." + ext
        let file = dir.appendingPathComponent(name)
        do {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            if !FileManager.default.fileExists(atPath: file.path) { try d.write(to: file, options: .atomic) }
        } catch { return nil }
        return "vanta-img://local/" + name
    }
    func webView(_ w: WKWebView, start task: WKURLSchemeTask) {
        let id = ObjectIdentifier(task), url = task.request.url, dir = imagesDir
        let name = url?.lastPathComponent ?? ""
        liveImageTasks.insert(id)
        DispatchQueue.global(qos: .userInitiated).async {
            let valid = name.range(of: "^[0-9a-f]{64}\\.(jpg|png|gif|webp)$", options: .regularExpression) != nil
            let data = valid ? try? Data(contentsOf: dir.appendingPathComponent(name)) : nil
            DispatchQueue.main.async {
                guard self.liveImageTasks.remove(id) != nil else { return }
                guard let data = data, let url = url, let resp = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: ["Content-Type": Self.imageTypes[(name as NSString).pathExtension] ?? "image/jpeg", "Content-Length": String(data.count), "Cache-Control": "max-age=31536000, immutable"]) else { return task.didFailWithError(URLError(.fileDoesNotExist)) }
                task.didReceive(resp); task.didReceive(data); task.didFinish()
            }
        }
    }
    func webView(_ w: WKWebView, stop task: WKURLSchemeTask) { liveImageTasks.remove(ObjectIdentifier(task)) }
    func imageNames(in text: String) -> [NSTextCheckingResult] { Self.imageRef.matches(in: text, range: NSRange(location: 0, length: (text as NSString).length)) }
    /// A backup you can take anywhere: the journal with every screenshot written back inside it, streamed to disk.
    func writeExport(from file: URL, images: URL, to out: URL) throws {
        let text = try String(contentsOf: file, encoding: .utf8), ns = text as NSString
        FileManager.default.createFile(atPath: out.path, contents: nil)
        let h = try FileHandle(forWritingTo: out); defer { try? h.close() }
        var at = 0
        for m in imageNames(in: text) {
            let name = ns.substring(with: m.range(at: 1))
            guard let d = try? Data(contentsOf: images.appendingPathComponent(name)) else { continue }
            try h.write(contentsOf: Data(ns.substring(with: NSRange(location: at, length: m.range.location - at)).utf8))
            try h.write(contentsOf: Data(("data:" + (Self.imageTypes[(name as NSString).pathExtension] ?? "image/jpeg") + ";base64,").utf8))
            try h.write(contentsOf: Data(d.base64EncodedString().utf8))
            at = m.range.location + m.range.length
        }
        try h.write(contentsOf: Data(ns.substring(from: at).utf8))
    }
    /// Removes screenshots nothing uses any more. It keeps anything named by the journal or any backup, anything
    /// under a week old, and stops without deleting if any of those files cannot be read.
    func collectUnusedImages(data: URL) {
        let fm = FileManager.default, images = data.appendingPathComponent("images"), journal = data.appendingPathComponent("journal.json"), backups = data.appendingPathComponent("backups")
        guard let files = try? fm.contentsOfDirectory(at: images, includingPropertiesForKeys: [.contentModificationDateKey]), !files.isEmpty, fm.fileExists(atPath: journal.path) else { return }
        var used = Set<String>()
        let sources = [journal] + ((try? fm.contentsOfDirectory(at: backups, includingPropertiesForKeys: nil)) ?? []).filter { $0.pathExtension == "json" }
        for s in sources {
            guard let text = try? String(contentsOf: s, encoding: .utf8) else { return }
            let ns = text as NSString
            for m in imageNames(in: text) { used.insert(ns.substring(with: m.range(at: 1))) }
        }
        let cutoff = Date().addingTimeInterval(-7 * 86400)
        for f in files where !used.contains(f.lastPathComponent) && f.lastPathComponent.range(of: "^[0-9a-f]{64}\\.", options: .regularExpression) != nil {
            if let d = try? f.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate, d < cutoff { try? fm.removeItem(at: f) }
        }
    }

    let net = URLSession(configuration: { let c = URLSessionConfiguration.ephemeral; c.timeoutIntervalForRequest = 30; c.timeoutIntervalForResource = 120; return c }())

    func notionCall(_ method: String, _ path: String, _ body: String, key: String, done: @escaping (Int, Double, String) -> Void) {
        guard NotionGate.allows(method: method, path: path), let url = URL(string: NotionGate.api + path) else { return done(-1, 0, "") }
        var r = URLRequest(url: url); r.httpMethod = method
        r.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        r.setValue(NotionGate.version, forHTTPHeaderField: "Notion-Version")
        if method == "POST" { r.setValue("application/json", forHTTPHeaderField: "Content-Type"); r.httpBody = Data(body.utf8) }
        net.dataTask(with: r) { d, resp, err in
            let http = resp as? HTTPURLResponse
            let retry = Double(http?.value(forHTTPHeaderField: "Retry-After") ?? "") ?? 0
            let text = d.flatMap { String(data: $0, encoding: .utf8) } ?? err?.localizedDescription ?? ""
            DispatchQueue.main.async { done(http?.statusCode ?? 0, retry, text) }
        }.resume()
    }

    func applicationDidFinishLaunching(_ note: Notification) {
        buildMenu()
        let cfg = WKWebViewConfiguration()
        cfg.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "vanta")
        cfg.setURLSchemeHandler(self, forURLScheme: "vanta-img")
        web = WKWebView(frame: .zero, configuration: cfg)
        web.uiDelegate = self
        web.navigationDelegate = self
        web.setValue(false, forKey: "drawsBackground")

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1320, height: 880),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                          backing: .buffered, defer: false)
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.title = "Vanta"
        window.backgroundColor = .black
        window.appearance = NSAppearance(named: .darkAqua)
        window.minSize = NSSize(width: 420, height: 600)
        window.isReleasedWhenClosed = false
        window.contentView = web
        window.center()
        window.setFrameAutosaveName("VantaMain")
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        let page = Bundle.main.url(forResource: "vanta", withExtension: "html")!
        web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ s: NSApplication) -> Bool { true }

    /// Waits for the last edit to reach the disk before quitting.
    func applicationShouldTerminate(_ s: NSApplication) -> NSApplication.TerminateReply {
        var done = false
        let finish = { if !done { done = true; NSApp.reply(toApplicationShouldTerminate: true) } }
        web.callAsyncJavaScript("await persist();", arguments: [:], in: nil, in: .page) { _ in
            self.io.async { RunLoop.main.perform(inModes: [.common], block: finish); CFRunLoopWakeUp(CFRunLoopGetMain()) }
        }
        RunLoop.main.add(Timer(timeInterval: 3, repeats: false) { _ in finish() }, forMode: .common)
        return .terminateLater
    }

    // MARK: Bridge
    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage, replyHandler reply: @escaping (Any?, String?) -> Void) {
        guard let body = m.body as? [String: Any], let action = body["action"] as? String else { return reply(nil, "bad message") }
        switch action {
        case "load":
            let file = journal, dir = dataDir
            io.async { let r = self.readJournal(file, dir); DispatchQueue.main.async { reply(r, nil) } }
            io.asyncAfter(deadline: .now() + 8) { self.collectUnusedImages(data: dir) }
        case "imageSave":
            let text = body["data"] as? String ?? "", dir = imagesDir
            DispatchQueue.global(qos: .userInitiated).async {
                let ref = self.saveImage(text, in: dir)
                DispatchQueue.main.async { ref != nil ? reply(ref, nil) : reply(nil, "That screenshot could not be saved.") }
            }
        case "exportBackup":
            let p = NSSavePanel(); p.nameFieldStringValue = body["name"] as? String ?? "vanta-backup.json"
            let file = journal, images = imagesDir
            p.beginSheetModal(for: window) { r in
                guard r == .OK, let u = p.url else { return reply(nil, nil) }
                self.io.async {
                    do { try self.writeExport(from: file, images: images, to: u); DispatchQueue.main.async { reply(u.path, nil) } }
                    catch { DispatchQueue.main.async { reply(nil, error.localizedDescription) } }
                }
            }
        case "save":
            guard let json = body["json"] as? String else { return reply(nil, "nothing to save") }
            let file = journal, dir = dataDir
            io.async {
                do { try self.write(json, file, dir); DispatchQueue.main.async { reply(true, nil) } }
                catch { DispatchQueue.main.async { reply(nil, error.localizedDescription) } }
            }
        case "info":
            reply(["path": dataDir.path, "custom": customDir != nil], nil)
        case "theme":
            let dark = body["dark"] as? Bool ?? true
            window.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
            window.backgroundColor = dark ? .black : .white
            reply(true, nil)
        case "notionStatus":
            reply(["connected": NotionKey.get() != nil], nil)
        case "notionSetKey":
            let key = (body["key"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            guard !key.isEmpty else { return reply(["ok": false, "error": "Paste your Notion secret first."], nil) }
            notionCall("GET", "/v1/users/me", "", key: key) { status, _, _ in
                if status == 200 {
                    if NotionKey.set(key) { reply(["ok": true], nil) }
                    else { reply(["ok": false, "error": "The key works, but your Mac's Keychain would not save it."], nil) }
                } else if status == 0 { reply(["ok": false, "error": "Notion could not be reached. Check your internet and try again."], nil) }
                else { reply(["ok": false, "error": "Notion did not accept that key. Copy the secret again and paste it here."], nil) }
            }
        case "notionForget":
            NotionKey.forget(); reply(true, nil)
        case "notionRequest":
            let method = body["method"] as? String ?? "", path = body["path"] as? String ?? "", text = body["body"] as? String ?? ""
            guard NotionGate.allows(method: method, path: path) else { return reply(nil, "Vanta only reads from Notion.") }
            guard let key = NotionKey.get() else { return reply(["status": 401, "retryAfter": 0, "body": "{}"], nil) }
            notionCall(method, path, text, key: key) { status, retry, out in reply(["status": status, "retryAfter": retry, "body": out], nil) }
        case "notionImage":
            guard let s = body["url"] as? String, let u = URL(string: s), u.scheme == "https" || NotionGate.api.hasPrefix("http://") else { return reply(nil, "That image address is not allowed.") }
            net.dataTask(with: URLRequest(url: u)) { d, resp, err in
                let http = resp as? HTTPURLResponse
                let mime = http?.mimeType ?? ""
                DispatchQueue.main.async {
                    guard err == nil, http?.statusCode == 200, let d = d, d.count <= 25_000_000, !mime.hasPrefix("text/") else { return reply(nil, "A screenshot could not be downloaded.") }
                    reply(["base64": d.base64EncodedString(), "type": mime.hasPrefix("image/") ? mime : "image/png"], nil)
                }
            }.resume()
        case "openURL":
            guard let s = body["url"] as? String, let u = URL(string: s), u.scheme == "https", let host = u.host,
                  host == "notion.so" || host == "notion.com" || host.hasSuffix(".notion.so") || host.hasSuffix(".notion.com") else { return reply(nil, "That link is not allowed.") }
            NSWorkspace.shared.open(u); reply(true, nil)
        case "reveal":
            try? FileManager.default.createDirectory(at: dataDir, withIntermediateDirectories: true)
            if FileManager.default.fileExists(atPath: journal.path) { NSWorkspace.shared.activateFileViewerSelecting([journal]) }
            else { NSWorkspace.shared.open(dataDir) }
            reply(true, nil)
        case "chooseFolder":
            let p = NSOpenPanel()
            p.canChooseDirectories = true; p.canChooseFiles = false; p.canCreateDirectories = true
            p.prompt = "Use This Folder"; p.message = "Choose where Vanta keeps your journal. A folder in iCloud Drive also syncs it."
            p.beginSheetModal(for: window) { r in
                guard r == .OK, let u = p.url else { return reply(nil, nil) }
                let fm = FileManager.default, from = self.imagesDir, to = u.appendingPathComponent("images")
                try? fm.createDirectory(at: to, withIntermediateDirectories: true)
                for f in (try? fm.contentsOfDirectory(atPath: from.path)) ?? [] where !fm.fileExists(atPath: to.appendingPathComponent(f).path) { try? fm.copyItem(at: from.appendingPathComponent(f), to: to.appendingPathComponent(f)) }
                UserDefaults.standard.set(u.path, forKey: self.folderKey)
                reply(["path": u.path, "existing": FileManager.default.fileExists(atPath: u.appendingPathComponent("journal.json").path)], nil)
            }
        case "saveAs":
            let p = NSSavePanel()
            p.nameFieldStringValue = body["name"] as? String ?? "vanta-export"
            let text = body["text"] as? String ?? ""
            p.beginSheetModal(for: window) { r in
                guard r == .OK, let u = p.url else { return reply(nil, nil) }
                do { try text.write(to: u, atomically: true, encoding: .utf8); reply(u.path, nil) }
                catch { reply(nil, error.localizedDescription) }
            }
        default:
            reply(nil, "unknown action")
        }
    }

    /// A damaged journal is set aside, never overwritten, and the newest good backup opens instead.
    func readJournal(_ file: URL, _ dir: URL) -> String? {
        let fm = FileManager.default
        guard let d = try? Data(contentsOf: file) else { return newestBackup(dir) }
        if (try? JSONSerialization.jsonObject(with: d)) != nil { return String(data: d, encoding: .utf8) }
        try? fm.moveItem(at: file, to: dir.appendingPathComponent("journal.damaged-\(Int(Date().timeIntervalSince1970)).json"))
        return newestBackup(dir)
    }
    func newestBackup(_ dir: URL) -> String? {
        let b = dir.appendingPathComponent("backups")
        let names = ((try? FileManager.default.contentsOfDirectory(atPath: b.path)) ?? []).filter { $0.hasPrefix("journal-") }.sorted().reversed()
        for n in names {
            if let d = try? Data(contentsOf: b.appendingPathComponent(n)), (try? JSONSerialization.jsonObject(with: d)) != nil { return String(data: d, encoding: .utf8) }
        }
        return nil
    }
    func write(_ json: String, _ file: URL, _ dir: URL) throws {
        let fm = FileManager.default
        let backups = dir.appendingPathComponent("backups")
        try fm.createDirectory(at: backups, withIntermediateDirectories: true)
        let data = Data(json.utf8)
        try data.write(to: file, options: .atomic)
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; f.locale = Locale(identifier: "en_US_POSIX")
        let today = backups.appendingPathComponent("journal-\(f.string(from: Date())).json")
        if !fm.fileExists(atPath: today.path) {
            try data.write(to: today, options: .atomic)
            // Keep the newest 14 daily copies, so backups cannot quietly fill the disk.
            let all = ((try? fm.contentsOfDirectory(atPath: backups.path)) ?? []).filter { $0.hasPrefix("journal-") && $0.hasSuffix(".json") }.sorted()
            for old in all.dropLast(14) { try? fm.removeItem(at: backups.appendingPathComponent(old)) }
        }
    }

    // MARK: Web view plumbing
    func webView(_ w: WKWebView, runOpenPanelWith p: WKOpenPanelParameters, initiatedByFrame f: WKFrameInfo, completionHandler done: @escaping ([URL]?) -> Void) {
        let o = NSOpenPanel()
        o.allowsMultipleSelection = p.allowsMultipleSelection
        o.canChooseDirectories = p.allowsDirectories
        o.canChooseFiles = !p.allowsDirectories
        o.beginSheetModal(for: window) { r in done(r == .OK ? o.urls : nil) }
    }
    /// Keeps the app on its one page. Anything else opens in the default browser.
    func webView(_ w: WKWebView, decidePolicyFor a: WKNavigationAction, decisionHandler h: @escaping (WKNavigationActionPolicy) -> Void) {
        if a.request.url?.isFileURL == true && a.navigationType == .other { return h(.allow) }
        if a.request.url?.scheme == "about" || a.targetFrame?.isMainFrame == false { return h(.allow) }
        if let u = a.request.url, u.scheme == "https" { NSWorkspace.shared.open(u) }
        h(.cancel)
    }

    // MARK: Menu
    @objc func newTrade() { web.evaluateJavaScript("window.vantaNewTrade()") }
    func buildMenu() {
        let main = NSMenu()
        func add(_ title: String, _ items: [NSMenuItem]) -> NSMenu { let i = NSMenuItem(); main.addItem(i); let m = NSMenu(title: title); items.forEach(m.addItem); i.submenu = m; return m }
        func it(_ t: String, _ a: Selector?, _ k: String = "") -> NSMenuItem { NSMenuItem(title: t, action: a, keyEquivalent: k) }
        _ = add("Vanta", [it("About Vanta", #selector(NSApplication.orderFrontStandardAboutPanel(_:))), .separator(), it("Hide Vanta", #selector(NSApplication.hide(_:)), "h"), .separator(), it("Quit Vanta", #selector(NSApplication.terminate(_:)), "q")])
        let nt = it("New Trade", #selector(newTrade), "n"); nt.target = self
        _ = add("File", [nt, .separator(), it("Close Window", #selector(NSWindow.performClose(_:)), "w")])
        let redo = it("Redo", Selector(("redo:")), "z"); redo.keyEquivalentModifierMask = [.command, .shift]
        _ = add("Edit", [it("Undo", Selector(("undo:")), "z"), redo, .separator(), it("Cut", #selector(NSText.cut(_:)), "x"), it("Copy", #selector(NSText.copy(_:)), "c"), it("Paste", #selector(NSText.paste(_:)), "v"), it("Select All", #selector(NSText.selectAll(_:)), "a")])
        let win = add("Window", [it("Minimize", #selector(NSWindow.performMiniaturize(_:)), "m"), it("Zoom", #selector(NSWindow.performZoom(_:)))])
        NSApp.windowsMenu = win
        NSApp.mainMenu = main
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
