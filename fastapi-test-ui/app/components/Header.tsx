"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Anasayfa" },
    { href: "/upload", label: "Dosya Yükle" },
    { href: "/url-import", label: "Link ile Test" },
    { href: "/history", label: "Geçmiş Testler" },
  ];

  return (
    <header className="bg-white border-b shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/response.png" // PNG veya SVG dosyanın yolu (public klasöründe olmalı)
            alt="Logo"
            width={32}
            height={32}
            className="rounded-sm"
          />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            API Test Tool
          </span>
        </Link>
        <nav className="space-x-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href
                  ? "text-blue-600 dark:text-blue-300"
                  : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
