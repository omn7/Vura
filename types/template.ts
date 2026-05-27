export interface TemplateField {
  id: string
  label: string
  x: number
  y: number
  fontSize: number
  color: string
  align: 'left' | 'center' | 'right'
}

export interface TemplateData {
  id: string
  name: string
  eventId: string
  bgImageUrl: string
  fields: TemplateField[]
  createdAt: Date
  updatedAt: Date
}

export interface DraggingState {
  fieldId: string
  startMouseX: number
  startMouseY: number
  startFieldX: number
  startFieldY: number
}
