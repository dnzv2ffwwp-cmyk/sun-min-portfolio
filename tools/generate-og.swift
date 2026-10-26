import AppKit
import CoreText

// Run from the repository root: swift tools/generate-og.swift
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let fontURL = root.appendingPathComponent("font/세방고딕체/SEBANG Gothic.ttf")
CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, nil)
let descriptors = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as! [CTFontDescriptor]
let headingFont = CTFontCreateWithFontDescriptor(descriptors[0], 104, nil) as NSFont
let width = 1200, height = 630
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
  bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
  colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
let context = NSGraphicsContext.current!.cgContext
context.translateBy(x: 0, y: CGFloat(height))
context.scaleBy(x: 1, y: -1)
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()
func color(_ value: UInt32) -> NSColor {
  NSColor(srgbRed: CGFloat((value >> 16) & 255) / 255,
    green: CGFloat((value >> 8) & 255) / 255, blue: CGFloat(value & 255) / 255, alpha: 1)
}
func text(_ value: String, x: CGFloat, y: CGFloat, font: NSFont, ink: NSColor, kern: CGFloat = 0) {
  // AppKit text drawing needs an explicitly flipped graphics context.
  let attributes: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: ink, .kern: kern]
  NSAttributedString(string: value, attributes: attributes).draw(with: NSRect(x: x, y: y, width: 1080, height: 160),
    options: [.usesLineFragmentOrigin], context: nil)
}
let flipped = NSGraphicsContext(cgContext: context, flipped: true)
NSGraphicsContext.current = flipped
text("JUNG SUNMIN / WEB DESIGNER", x: 70, y: 44, font: .systemFont(ofSize: 13, weight: .medium), ink: color(0x686866), kern: 1.2)
color(0xE2E2E0).setFill()
NSRect(x: 70, y: 84, width: 1060, height: 1).fill()
text("VISUAL DESIGN ARCHIVE", x: 70, y: 156, font: .systemFont(ofSize: 17, weight: .semibold), ink: color(0x0A67B9), kern: 2)
text("Clear message.", x: 64, y: 213, font: headingFont, ink: color(0x111111), kern: -6)
text("Quiet impact.", x: 64, y: 321, font: headingFont, ink: color(0xAAA9A5), kern: -6)
text("SELECTED WORKS · 2026", x: 70, y: 555, font: .systemFont(ofSize: 13, weight: .medium), ink: color(0x686866), kern: 1.1)
NSGraphicsContext.restoreGraphicsState()
let destination = root.appendingPathComponent("assets/og/visual-design-archive.png")
try bitmap.representation(using: .png, properties: [:])!.write(to: destination)
print(destination.path)
