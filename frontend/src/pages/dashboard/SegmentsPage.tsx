import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal, 
  Pencil, 
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSegmentStore } from '@/store/segmentStore'

export default function SegmentsPage() {
  const { t } = useTranslation()
  const { segments, fetchSegments, createSegment, updateSegment, deleteSegment, loading } = useSegmentStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    attribute: '',
    operator: 'IS_IN',
    value: ''
  })

  // Mock project ID for now - should come from context/store
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const projectId = user.lastProjectId

  useEffect(() => {
    if (projectId) {
      fetchSegments(projectId)
    }
  }, [projectId, fetchSegments])

  const generateKey = (name: string) => {
    return name
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (!editingSegment) {
      setFormData(prev => ({ ...prev, name, key: generateKey(name) }))
    } else {
      setFormData(prev => ({ ...prev, name }))
    }
  }

  const handleSubmit = async () => {
    if (!projectId) return

    try {
      const values = formData.value.split(',').map(v => v.trim()).filter(v => v)
      const rules = [{
        attribute: formData.attribute,
        operator: formData.operator,
        value: values
      }]

      if (editingSegment) {
        await updateSegment(editingSegment.id, {
          name: formData.name,
          description: formData.description,
          rules
        })
      } else {
        await createSegment(projectId, {
          name: formData.name,
          key: formData.key,
          description: formData.description,
          rules
        })
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (segment: any) => {
    setEditingSegment(segment)
    // Extract first rule for simple edit form
    const rule = segment.rules?.[0] || { attribute: '', operator: 'IS_IN', value: [] }
    const valueStr = Array.isArray(rule.value) ? rule.value.join(', ') : rule.value

    setFormData({
      name: segment.name,
      key: segment.key,
      description: segment.description || '',
      attribute: rule.attribute,
      operator: rule.operator || 'IS_IN',
      value: valueStr
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      await deleteSegment(id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      attribute: '',
      operator: 'IS_IN',
      value: ''
    })
    setEditingSegment(null)
  }

  const filteredSegments = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('segments.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('segments.descHelper')}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('segments.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSegment ? t('segments.edit') : t('segments.create')}</DialogTitle>
                <DialogDescription>
                  {t('segments.defineGroup')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('flags.name')}</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={handleNameChange} 
                    placeholder="e.g. Beta Users" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">{t('flags.key')}</Label>
                  <Input 
                    id="key" 
                    value={formData.key} 
                    disabled={!!editingSegment}
                    onChange={(e) => setFormData({...formData, key: e.target.value})} 
                    className="font-mono bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('flags.description')}</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-medium mb-3 text-sm">{t('segments.targetingRule')}</h4>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="attribute">{t('segments.attribute')}</Label>
                        <Input 
                          id="attribute" 
                          value={formData.attribute} 
                          onChange={(e) => setFormData({...formData, attribute: e.target.value})} 
                          placeholder={t('segments.attributePlaceholder')} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="operator">{t('segments.operator')}</Label>
                        <Select 
                          value={formData.operator} 
                          onValueChange={(val) => setFormData({...formData, operator: val})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IS_IN">{t('segments.isIn')}</SelectItem>
                            <SelectItem value="IS_NOT_IN">{t('segments.isNotIn')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="value">{t('segments.values')}</Label>
                      <Textarea 
                        id="value" 
                        value={formData.value} 
                        onChange={(e) => setFormData({...formData, value: e.target.value})} 
                        placeholder={t('segments.valuesPlaceholder')} 
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleSubmit}>{editingSegment ? t('common.save') : t('segments.create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-background relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('segments.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('flags.name')}</TableHead>
                <TableHead>{t('flags.key')}</TableHead>
                <TableHead>{t('segments.targetingRule')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredSegments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t('segments.noSegments')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSegments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {segment.name}
                      </div>
                      {segment.description && (
                        <div className="text-muted-foreground text-xs mt-0.5 max-w-[300px] truncate">
                          {segment.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{segment.key}</code>
                    </TableCell>
                    <TableCell>
                      {segment.rules?.map((rule: any, i: number) => (
                        <div key={i} className="text-sm">
                          <code className="text-primary">{rule.attribute}</code>
                          <span className="mx-1 text-muted-foreground">{rule.operator === 'IS_NOT_IN' ? t('segments.isNotIn') : t('segments.isIn')}</span>
                          <span className="font-medium">
                            {t('segments.valuesCount', { count: Array.isArray(rule.value) ? rule.value.length : 1 })}
                          </span>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(segment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(segment.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
