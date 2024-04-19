import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.svg'
import { FiUser, FiLogIn } from 'react-icons/fi';
import { FiMail } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';



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
          <Link to="https://mail.google.com/mail/u/0/#inbox?compose=new " className="text-cyan-100" title="Gmail: damiaomartinspintor@gmail.com">
            <FiMail size={30} color= "#e4be13"/>
          </Link>
           <Link to="https://www.instagram.com/damiao3790" title="Instagram">
             <FaInstagram size={30} color="#e53804"/>
           </Link>
           {!loadingAuth && signed && (
             <Link to="/dashboard">
             <div className="border-2 rounded-full p-1 border-aqua" title="Area Privada">
               <FiUser size={22} color="#04a9e5"/>
             </div>
           </Link>
           )}
           {!loadingAuth && !signed && (
             <Link to="/login">
            <div className="border-2 rounded-full p-1 border-aqua" title="Area Privada">
             <FiLogIn size={22} color="#04a9e5"/>
            </div>
           </Link>
           )}
        </header>
      </div>
      
  
  )
}

