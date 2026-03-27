import { useState, KeyboardEvent, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Ellipsis } from 'lucide-react'

interface DiseaseTagInputProps {
  id?: string
  initialTags?: string[] // New Prop
  onTagsChange?: (tags: string[]) => void
}

export function DiseaseTagInput({
  id,
  initialTags = [],
  onTagsChange,
}: DiseaseTagInputProps) {
  // Initialize with initialTags
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState('')

  // Sync internal tags when initialTags prop changes (crucial for Editing)
  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  // Notify parent of changes
  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(tags)
    }
  }, [tags, onTagsChange])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      const newTag = inputValue.trim().replace(/,$/, '').toUpperCase()

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="w-full">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span className="font-bold">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive transition-colors focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          className="pl-9 uppercase"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Others (specify) and enter"
        />
        <Ellipsis className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  )
}
