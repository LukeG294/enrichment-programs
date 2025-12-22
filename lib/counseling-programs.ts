export interface CounselingProgram {
  id: number
  program: string
  organization: string
  location: string | null
  description: string | null
  link: string | null
  programTypeId: number | null
  programTypeName: string | null
  programTypeColor: string | null
  tags: string[]
}
