import { SafeParseReturnType, ZodObject, ZodRawShape } from "zod"

import { useState } from "react"

type StringValues<T> = {
  [K in keyof T]: string
}

function convertToString<T extends ZodRawShape>(originalType: ZodObject<T, any, any, any, any>) {
  const stringValues: StringValues<T> = {} as StringValues<T>

  for (const key in originalType.shape) {
    stringValues[key] = ""
  }

  return stringValues
}

type ObjectType<T extends ZodRawShape> = ZodObject<T, any, any, any, any>

export const useErrorControl = <T extends ZodRawShape>(data: ObjectType<T>) => {
  type ModifiedT = { [K in keyof T]: string }

  const converted = convertToString(data)
  const [errors, setErrors] = useState<ModifiedT>(converted)

  const setErrorsWrapper = (data: SafeParseReturnType<ModifiedT, any> | { [K in keyof ModifiedT]?: string }) => {
    setErrors((prev) => {
      if (typeof data.success !== "boolean") {
        let newErrors = { ...prev }
        for (const error of Object.keys(errors)) {
          newErrors = {
            ...newErrors,
            [error]: data[error] ?? "",
          }
        }
        return newErrors
      }

      const castData = data as SafeParseReturnType<ModifiedT, any>

      const foundErrors = !castData.success ? castData.error.issues : []
      let newErrors = { ...prev }

      for (const error of Object.keys(errors)) {
        newErrors = {
          ...newErrors,
          [error]: foundErrors.find((e) => e.path.at(0) === error)?.message ?? "",
        }
      }

      return newErrors
    })
  }

  return [errors, setErrorsWrapper] as const
}
