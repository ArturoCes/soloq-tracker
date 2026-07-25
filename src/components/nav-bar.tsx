"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Swords } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Clasificación" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/comparar", label: "Comparador" },
];

export function NavBar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function search(form: HTMLFormElement) {
    const q = new FormData(form).get("q");
    if (q) router.push(`/buscar?q=${encodeURIComponent(String(q))}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Swords className="size-5 text-primary" />
          <span>
            SoloQ<span className="text-primary">Tracker</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          className="hidden max-w-xs flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            search(e.currentTarget);
          }}
        >
          <Input name="q" placeholder="Buscar jugador..." className="h-9" />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <form
                className="px-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  search(e.currentTarget);
                }}
              >
                <Input name="q" placeholder="Buscar jugador..." className="h-9" />
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
