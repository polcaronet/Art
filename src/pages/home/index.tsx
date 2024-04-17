
import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import { Link } from "react-router-dom";
import { 
  collection,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore'
import { firestore } from  '../../services/firebaseConnection'

interface  ArtsProps{
  id: string;
  name: string;
  year: string;
  uid: string;
  city: string;
  cm: string;
 images: ArtImageProps[];
}

interface ArtImageProps{
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [arts, setArts] = useState<ArtsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState("")
  useEffect(() => {
   loadArts(); 
  }, [])

  function loadArts(){
    const artsRef = collection(firestore, "arts")
    const queryRef = query(artsRef, orderBy("created", "desc"))

   getDocs(queryRef)
   .then((snapshot)=> {
     let listarts = [] as ArtsProps[];

     snapshot.forEach( doc => {
       listarts.push({
         id: doc.id,
         name: doc.data().name,
         year: doc.data().year,
         cm: doc.data().cm,
         city: doc.data().city,
         images: doc.data().images,
         uid: doc.data().uid,
         })
       })
       setArts(listarts);
     })
   }

  function handleImageLoad(id: string){
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  } 

  async function handleSearchArt(){
    if(input === ''){
      loadArts();
      return;
    }

    setArts([]);
    setLoadImages([]);
    
    const search = query(collection(firestore, "arts"),
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    )

    const querySnapshot = await getDocs(search)

    let listarts = [] as ArtsProps[];
    
    querySnapshot.forEach((doc) => {
      listarts.push({
        id: doc.id,
        name: doc.data().name,
        year: doc.data().year,
        cm: doc.data().cm,
        city: doc.data().city,
        images: doc.data().images,
        uid: doc.data().uid,
      })
    })

    setArts(listarts); 
  }

 
  return (
    
  <Container>
    <section className="bg-blue-700 p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
      <input
        className="w-full border-2 rounded-xl h-9 px-3 outline-none"
        placeholder="Digito o nome do quadro... Ex: colheita de feno"
        value={input}
        onChange={ (e) => setInput(e.target.value) }
      />
        <button
          className="bg-red-500 h-9 px-8 rounded-lg text-white justify-between font-bold text-lg " 
          onClick={handleSearchArt}
        >
        Pesquisar
        </button>
    </section>
     <div className="flex flex-col items-center justify-center ">
     <h1  className="font-bold flex flex-col items-center justify-center mt-8 text-3xl mb-12 hover:animate-floatUP text-white shadow border-b-0 ">
          Façam um Tour pelas Obras de Damião Martins 👇🏻
        
    </h1>
    </div>
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

      
      {arts.map( art => (
        <Link key={art.id} to={`/art/${art.id}`}>
          <section className="w-full bg-blue-700 drop-shadow">
            <div 
              className="w-full h-72 object-cover bg-slate-200"
              style={{ display: loadImages.includes(art.id) ? "none" : "block"}}
            >

            </div>
           <img
              className="w-full object-cover border-b-shadow mb-2 h-auto hover:scale-105 transition-all"
              src={art.images[0].url}
              alt="Menina com bicicleta" 
              onLoad={ () => handleImageLoad(art.id) }
              style={{ display: loadImages.includes(art.id) ? "block" : "none"}}
           />
            <p className="bg-aqua drop-shadow-sm font-bold mt-1 mb-2 px-2 text-white">{art.name}</p>
              <div className="flex flex-col px-2">
                  <span className="mb-6 text-white font-medium">{art.year} | {art.cm} cm </span>
              </div>
              <div className="w-full h-px bg-aqua my-2"></div>

              <div className="px-2 pb-2">
                <span className="mb-6 text-white">
                  {art.city}
                </span>
              </div>

          </section> 
        </Link>   
      ))}
        
      </main>
  </Container>
  )
}


