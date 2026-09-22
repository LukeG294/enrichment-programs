export interface CounselingProgram {
  id: number
  program: string
  organization: string
  location: string | null
  description: string | null
  link: string | null
  category: string | null
  tags: string[]
}
