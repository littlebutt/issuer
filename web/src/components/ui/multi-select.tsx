import React from "react"
import Select from "react-tailwindcss-select"
import { SelectProps } from "react-tailwindcss-select/dist/components/type"

interface IMultiSelect {
    options: SelectProps["options"]
    value: SelectProps["value"]
    onChange: SelectProps["onChange"]
    placeholder? : string
}

const MultiSelect = React.forwardRef<React.ElementRef<typeof Select>, IMultiSelect>((props) => (
    <Select 
    classNames={{
        menuButton: () => "flex justify-end transition-all duration-300 rounded border border-zinc-200 bg-white text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2",
        menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
        listItem: () => "list-none py-1.5 px-2 hover:bg-blue-500 rounded-md hover:text-white cursor-pointer"
}}
    options={props.options} value={props.value} onChange={props.onChange} primaryColor="black" isMultiple placeholder={props.placeholder ?? ""}/>
))

export { MultiSelect }
export type { IMultiSelect }
