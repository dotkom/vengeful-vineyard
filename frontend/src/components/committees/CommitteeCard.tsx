interface CommitteeCardProps {
  image: string
  name: string
  total_value: number
  total_value_this_year: number
}

interface CardDetailsRowProps {
  label: string
  value: string
}

export const CardDetailsRow = ({ label, value }: CardDetailsRowProps) => (
  <div className="flex w-full justify-between items-center">
    <span className="font-semibold text-gray-700">{label}</span>
    <span className="text-lg font-semibold text-black">{value},-</span>
  </div>
)

export const CommitteeCard = ({ image, name, total_value, total_value_this_year }: CommitteeCardProps) => {
  const numberFormatter = new Intl.NumberFormat("nb-NO")

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 pb-5 flex flex-col items-center w-60">
      <div className="mb-4">
        <img className="h-32 w-32 grayscale dark:invert dark:contrast-200" src={image} alt={name + " Logo"} />
      </div>
      <span className="text-lg font-bold text-gray-800 mb-4">{name}</span>
      <CardDetailsRow label="Sum i år:" value={numberFormatter.format(total_value_this_year)} />
      <CardDetailsRow label="Total sum:" value={numberFormatter.format(total_value)} />
    </div>
  )
}
