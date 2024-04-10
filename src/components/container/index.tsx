import { ReactNode } from "react"

export function Container({children}: { children: ReactNode }){
  return(
    <div className="w-full max-w-7xl mx-auto px-4 ">
      
      {children}
       <footer className="bg-zinc-900 flex flex-col items-center justify-center py-3 gap-2 mt-0 rounded-md">
         <span className="text-white ">@2024  Damião Martins | design | Indivíduo Desenvolvedor </span>
       </footer>
    </div>
  )
}

