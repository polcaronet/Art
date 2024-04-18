import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.svg'
import { FiUser, FiLogIn } from 'react-icons/fi';



export function Header() {
  const { signed, loadingAuth } = useContext(AuthContext);
  
 
  return (
    
      <div className="w-full flex items-center justify-center h-16 bg-blue-900 drop-shadow mb-4 ">
        <header className="flex w-full items-center justify-between max-w-7xl px-4 mx-auto">
          <Link  to="/">
           <img
             src={logoImg} 
             alt="Logo do site"
           />
          </Link>
          <Link to="https://mail.google.com/mail/u/0/#inbox">
            <p 
            className="w-full items-center px-4 mx-auto flex justify-between mb:text-xl md:text-xl lg:text-3xl font-bold">
              Gmail: damiaomartinspintor@gmail.com
            </p>
          </Link>
           {!loadingAuth && signed && (
             <Link to="/dashboard">
             <div className="border-2 rounded-full p-1 border-aqua">
               <FiUser size={22} color="#04a9e5"/>
             </div>
           </Link>
           )}
           {!loadingAuth && !signed && (
             <Link to="/login">
            <div className="border-2 rounded-full p-1 border-aqua">
             <FiLogIn size={22} color="#04a9e5"/>
            </div>
           </Link>
           )}
        </header>
      </div>
      
  
  )
}

