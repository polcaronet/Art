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
           {!loadingAuth && signed && (
             <Link to="/dashboard">
             <div className="border-2 rounded-full p-1 border-gray-100">
               <FiUser size={22} color="#B7B7B8"/>
             </div>
           </Link>
           )}

           {!loadingAuth && !signed && (
             <Link to="/login">
            <div className="border-2 rounded-full p-1 border-gray-100">
             <FiLogIn size={22} color="#B7B7B8"/>
            </div>
           </Link>
           )}
        </header>
      </div>
      
  
  )
}

