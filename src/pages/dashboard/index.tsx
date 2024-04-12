import { Container } from "../../components/container";
import { DashboardHeader } from '../../components/panelheader'
import { FiTrash } from 'react-icons/fi'
import { useEffect, useState, useContext } from 'react'

import {
  collection,
  getDocs,
  where,
  query,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { firestore, storage } from '../../services/firebaseConnection'
import { ref, deleteObject } from 'firebase/storage'
import { AuthContext } from '../../contexts/AuthContext'

interface ArtProps {
  id: string;
  name: string;
  year: string;
  city: string;
  cm: string;
  images: ImageArtProps[];
  uid: string;
}

interface ImageArtProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [arts, setArts] = useState<ArtProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {

    function loadArts() {
      if (!user?.uid) {
        return;
      }
      const artsRef = collection(firestore, "arts")
      const queryRef = query(artsRef, where("uid", "==", user.uid))

      getDocs(queryRef)
        .then((snapshot) => {
          let listarts = [] as ArtProps[];

          snapshot.forEach(doc => {
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

    loadArts();
  }, [user])


  async function handleDeleteArt(art: ArtProps) {
     const itemArt = art;


    const docRef = doc(firestore, "arts", itemArt.id)
    await deleteDoc(docRef);

    itemArt.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath)

      try {
        await deleteObject(imageRef)
        setArts(arts.filter(art => art.id !== itemArt.id))
        
      } catch (err) {
        console.log("ERRO AO EXCLUIR ESSA IMAGEM")
      }

    })
  }

  return (

    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {arts.map(art => (
          <section key={art.id} className="w-full border-0 bg-blue-700 drop-shadow object-cover relative">
            <button
              onClick={() => handleDeleteArt(art)}
              className="absolute w-14 h-14 flex items-center justify-center right-2 top-2 drop-shadow hover:scale-150 duration-500"

            >
              <FiTrash size={28} color="rgb(25, 58, 189)" />
            </button>
            <img
              className="w-full  object-cover mb-2 max-h-screen"
              src={art.images[0].url}
              alt="Belas artes"
            />
            <p className=" text-white drop-shadow-sm font-bold mt-1 px-2 mb-2 bg-aqua">{art.name}</p>
            <div className="flex flex-col px-2">
              <span className="text-white ">
                {art.cm} cm
              </span>
              <strong className="text-white font-bold">
              
              </strong>
            </div>

            <div className="w-full bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-white">{art.city}</span>
            </div>
          </section>

        ))}

      </main>

    </Container>

  )
}

