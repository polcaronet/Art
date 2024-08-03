import { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {children}
      <footer className="bg-zinc-900 flex flex-col items-center justify-center py-3 gap-2 mt-0 rounded-md">
        <span className="text-white">
          @{currentYear} | Design Template |{" "}
          <a
            className="hover:text-blue-600 duration-300"
            href="https://www.linkedin.com/in/anselmo-polcaro-ribeiro-b2a570207"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polcaro
          </a>
        </span>
      </footer>
    </div>
  );
}
