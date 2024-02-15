import { CommitteeList } from "../../components/committees/CommitteeList"

export const Committees = () => {
    
    return (
        <section className="mt-8 mb-8 md:mt-16 max-w-8xl w-[90%] mx-auto">
            <h1 className="mb-14 text-center md:text-xl font-medium text-black">Total straffesum per komité</h1>
            <CommitteeList />
        </section>
    )
}