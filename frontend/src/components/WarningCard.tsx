import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface NavigationGuardProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function NavigationGuard({
  isOpen,
  onConfirm,
  onCancel,
}: NavigationGuardProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now, your progress will be
            lost. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Stay on Page</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Leave Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DeleteOrNot({
  isOpen,
  onConfirm,
  onCancel,
}: NavigationGuardProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Deletion</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface CancelGuardProps {
  isOpen: boolean
  onConfirm: (reason: string) => void | Promise<void>
  onCancel: () => void
}

const DELETION_REASONS = [
  { id: 'r1', value: 'Incorrect' },
  { id: 'r2', value: 'Duplicate' },
  { id: 'r3', value: 'Misidentification' },
  { id: 'r3', value: 'Revoked' },
  { id: 'r4', value: 'Other' },
]

export function CancelOrNot({ isOpen, onConfirm, onCancel }: CancelGuardProps) {
  const [reason, setReason] = useState<string>('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  const handleCancel = () => {
    onCancel()
    setReason('')
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Order Cancellation</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* --- Radio Group Section --- */}
        <div className="py-4">
          <p className="block text-sm font-medium text-foreground mb-4">
            Please select a reason for deletion:
          </p>

          <RadioGroup
            value={reason}
            onValueChange={setReason}
            className="flex flex-col space-y-2"
          >
            {DELETION_REASONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer text-sm">
                  {option.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        {/* --------------------------- */}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>No</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            // Disables the button until a radio option is selected
            disabled={!reason}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
