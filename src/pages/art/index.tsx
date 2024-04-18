import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { getDoc, doc } from 'firebase/firestore'
import { firestore } from '../../services/firebaseConnection'

import { Swiper, SwiperSlide } from 'swiper/react'

interface ArtProps{
    id: string;
  name: string;
  city: string;
  year: string;
    cm: string;
 description: string;
 created: string;
 owner: string;
   uid: string;
  images: ImagesArtProps[]
  whatsapp: string;
  gmail: string;
}

interface ImagesArtProps{
  uid: string;
  name: string;
  url: string;
}

export function ArtDetail() {
  const { id } = useParams();
  const [art, setArt] = useState<ArtProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadArt(){
      if(!id){ return }

      const docRef = doc(firestore, "arts", id)
      getDoc(docRef)
      .then((snapshot) => {

        if(!snapshot.data()){
          navigate("/")
        }

       setArt({
         id: snapshot.id,
         name: snapshot.data()?.name,
         year: snapshot.data()?.year,
         city: snapshot.data()?.city,
         uid: snapshot.data()?.uid,
         description: snapshot.data()?.description,
         created: snapshot.data()?.created,
         cm: snapshot.data()?.cm,
         whatsapp: snapshot.data()?.whatsapp,
         owner: snapshot.data()?.owner,
         images: snapshot.data()?.images,
         gmail:  snapshot.data()?.gmail,
       })
     })
   }

  loadArt()

  }, [id])


  useEffect(() => {
  
   function handleResize(){
     if(window.innerWidth < 720){
         setSliderPerView(1); 
       }else{
         setSliderPerView(2);
       }
     }

     handleResize();

     window.addEventListener("resize", handleResize)

     return() => {
       window.removeEventListener("resize", handleResize)
     }

  }, [])
  
 
  return (
    <Container>
      
        { art && (
            <Swiper
            slidesPerView = {sliderPerView}
            pagination = {{ clickable: true }}
            navigation
          >
            {art?.images.map( image => (
                <SwiperSlide key={image.name}>
                  <img 
                    src={image.url}
                    className="w-full h-auto object-cover"
                  />
                </SwiperSlide>
            ))}
          </Swiper>
        )}

      { art && (
      <main className="w-full bg-aqua text-white rounded-lg p-6 my-4">
        <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
          <h1 className="font-bold text-3xl ">{art?.name}</h1>
        </div>
        <p className="font-bold">Oleo sobre tela</p>
        
        <div className="flex w-full gap-6 my-4">
          <div className="flex flex-col gap-4">
            <div>
              <p>Cidade</p>
              <strong>{art?.city}</strong>
            </div> 
            <div>
              <p>Ano</p>
              <strong>{art?.year}</strong>
            </div> 
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p>Medidas</p>
              <strong>{art?.cm} cm</strong>
            </div> 
          </div>
        </div>

        <strong>Descrição:</strong>
        <p className="mb-4">{art?.description}</p>
        

        <strong>Telefone / WhatsApp</strong>
        <p>{art?.whatsapp}</p>
         <p>{art?.gmail}</p>
        <a
          href={`https://api.whatsapp.com/send/?type=phone=${art?.whatsapp}&text=Olá vi esse ${art.name} na galeria e fiquei interessado!`}
          className="cursor-pointer bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium"
        >
          Preço a Combinar
          <FaWhatsapp size={26} color="#FFF" />
        </a>

      </main>
      )}
    </Container>
    
  )
}

/*
  LINK WHATSAPP DAMIAO
 https://api.whatsapp.com/send/?phone=%2B5521996710902&text&type=phone_number&app_absent=0

*/
