import { FieldValues, RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  error?: string;
  rules?: RegisterOptions;
}


export function Input({ name, placeholder, type, register, rules, error }: InputProps) {
  return (
    <div>
      <input
        className="w-full border-2 rounded-md h-11 outline-none px-2 bg-white text-zinc-800"
        placeholder={placeholder}
        type={type}
        {...register(name, rules)}
        id={name}
      />
      {error && <p className="my-1 text-red-300">{error}</p>}
    </div>
  )
}