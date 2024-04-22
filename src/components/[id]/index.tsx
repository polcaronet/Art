import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";

interface PageDetailProps{
  params: {
    id: string;
  }
}

export default function HeaderId({ params}: PageDetailProps){
  return(
    <div>
      <h1>Página detalhes do HeaderId {params.id}</h1>
      <Link to="https://mail.google.com/mail/u/0/#inbox?compose=CllgCJqZhNrwQMMvsSjrbPTxWKKHQgBDCVfjnsXjvBlnlPpSlpxFLkhNNMZfMzbPKKjpQXfbZkg" className="text-cyan-100" title="damiaomartinspintor@gmail.com">
        <FiMail size={30} color= "#e4be13"/>
      </Link>
    </div>
  )
}