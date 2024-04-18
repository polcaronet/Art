import { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";

import { FiUpload, FiTrash } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { Input } from '../../../components/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'

import { storage, firestore } from '../../../services/firebaseConnection'
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'

import { addDoc, collection } from 'firebase/firestore'
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "O nome do quadro é obrigatório"),
  year: z.string().min(1, "O Ano é obrigatório é obrigatório"),
    cm: z.string().min(1, "O campo dimensão do quadro é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatoria"),
  whatsapp: z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{10,12})$/.test(value),{
  message: "Numero de telefone inválido."
  }),
  description: z.string().min(1, "A descrição é obrigatoria"),
})

type FormData = z.infer<typeof schema>;

interface ImageItemProps{
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {

  const { user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

 const [artImages, setArtImages] = useState<ImageItemProps[]>([])

 async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]

     if(image.type === 'image/jpeg' || image.type === 'image/png'){
      await  handleUpload(image)
      }else{
        alert("Envie uma imagem jpeg ou png!")
        return;
      }
    }
 }

 async function handleUpload(image: File){
    if(!user?.uid){
       return;
    }

    const currentUid = user?.uid;
    const uidImage =  uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
   .then((snapshot) => {
     getDownloadURL(snapshot.ref).then((downloadUrl) => {
      const imageItem = {
        name: uidImage,
        uid: currentUid,
    previewUrl: URL.createObjectURL(image),
        url: downloadUrl,
       }
    setArtImages((images) => [...images, imageItem] )
    toast.success("Quadro adicionado com sucesso!")
     })
   })

 } 

  function onSubmit(data: FormData){
   if(artImages.length == 0){
     toast.error("Envie pelo menos uma imagem!")
     return;
   }

   const artListImages = artImages.map( art => {
     return{
      uid: art.uid,
      name: art.name,
      url: art.url
     }
   })

  addDoc(collection(firestore, "arts"), {
   name: data.name.toUpperCase(),
   city: data.city,
    cm: data.cm,
    year: data.year,
    whatsapp: data.whatsapp,
    description: data.description,
    created: new Date(),
    owner: user?.uid,
    uid: user?.uid,
    images: artListImages
   })
    .then(() => {
      reset();
      setArtImages([]);
      console.log("CADASTRADO COM SUCESSO!");
      toast.success("Quadro enviado com sucesso!")
   })
    .catch((error) => {
      console.log(error)
      console.log("ERRO AO CADASTRAR NO BANCO")
      toast.error("Erro ao enviar o quadro!")
  })

  }

async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef)
      setArtImages(artImages.filter((art) => art.url !== item.url))
    }catch(err){
      console.log("ERRO AO DELETAR")
    }

  }

  return (
    <Container>
      <DashboardHeader/>

      <div className="w-full bg-aqua p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-piscina h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#64B7CC" />
          </div>
          <div className="cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              className="opacity-0 cursor-pointer" 
              onChange={handleFile} 
            />
          </div>
        </button>


        {artImages.map( item => (
          <div key={item.name} className="drop-shadow object-cover h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDeleteImage(item) }>
              <FiTrash size={28} color="#FFF"/>
            </button>
          <img 
            src={item.previewUrl}
            className="drop shadow w-full h-32 object-cover border-b-shadow"
            alt="Foto do Quadro" 
          />
          </div>
        ))}
      </div>

      <div className="w-full text-white bg-aqua p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form
         className="w-full"
         onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
             <p className="mb-2 font-medium">Nome do Quadro</p>
             <Input
               type="text"
               register={register}
               name="name"
               error={errors.name?.message}
               placeholder="Ex: Violinista"
             />
          </div>

         
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do Quadro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2015..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium"> Dimensões em cm </p>
              <Input
                type="text"
                register={register}
                name="cm"
                error={errors.cm?.message}
                placeholder="Ex: (50 x 40)"
              />
            </div>

          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 011999101923..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Maricá - RJ..."
              />
            </div>

            
          </div>

          <div className="mb-3">
            <p className="mb-4 font-medium">Descrição</p>
             <textarea
              className="border-2 w-full rounded-md h-24 px-2 text-black font-medium outline-none mt-3 mb-12"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o quadro..."
            />
            {errors.description && <p className="mb-1 text-red-300">{errors.description.message}</p>}
          </div>

          <button type="submit" className="w-full rounded-md bg-zinc-950 text-white font-medium h-12 mt-5">
            Cadastrar
          </button>

        </form>
        
      </div>
 
    </Container>
  )
}