interface CommitteeCardProps {
  name: string
  amount: number
  imgurl: string
}

export const CommitteeCard = ({ name, amount, imgurl }: CommitteeCardProps) => (
  <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center w-60 h-[17rem]">
    <div className="mb-4">
      <img className="h-32 w-32 grayscale dark:invert dark:contrast-200" src={imgurl} alt={name + " Logo"} />
    </div>
    <span className="block text-lg font-bold text-black">{name}</span>
    <span className="block text-lg font-bold text-black">{amount},-</span>
  </div>
)
