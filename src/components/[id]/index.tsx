interface PageDetailProps{
  params: {
    id: string;
  }
}

export default function HeaderId({ params}: PageDetailProps){
  return(
    <div>
      <h1>Página detalhes do HeaderId {params.id}</h1>
    </div>
  )
}