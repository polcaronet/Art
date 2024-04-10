import { ReactNode } from "react"

export function Container({children}: { children: ReactNode }){
  return(
        <div className="w-full max-w-7xl mx-auto px-4 ">
          <div className="bg-green-600 px-4 py-2 rounded-lg mt-5 " id="date-span">
          <span className="text-white font-bold max-w-12">Seg a Dom - 10:00 às 20:00</span>
        </div>
      {children}
       <footer className="bg-zinc-900 flex flex-col items-center justify-center py-3 gap-2 mt-0 rounded-md">
         <span className="text-white ">@2024  Damião Martins | design | Indivíduo Desenvolvedor </span>
       </footer>
    </div>
  )
}



