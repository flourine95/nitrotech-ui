---
inclusion: always
---

# Common Component Principles (CCP)

8 design criteria for building reusable React components, inspired by OOP principles.

## The 8 Principles

| # | Principle | Key Question | Violation Sign |
|---|-----------|--------------|----------------|
| 1 | Encapsulation | Does outside need to know inside? | Must pass internal state props |
| 2 | Single Responsibility | Does it do one thing? | Component name contains "And" |
| 3 | Stable Interface | Are props clear and typed? | Props named `data`, `config`, `options` |
| 4 | Composability | Can it fit anywhere? | Hardcodes layout, fetches data |
| 5 | Extensibility | Can extend without modifying? | Must fork to add icon/style |
| 6 | Predictability | Same input → same output? | Calls API internally |
| 7 | Testability | Can test independently? | Must mock store/API/providers |
| 8 | Accessibility | Works with keyboard/screen reader? | Uses `<div onClick>` |

---

## 1. Encapsulation

"Outside doesn't need to know inside"

Internal state and logic must be hidden. Users interact only through props as a public interface.

Violation signs:
- Must read source code to use
- Must pass too many internal props

BAD:
```typescript
// Exposes internal state, caller must manage it
const Dropdown = ({ isOpen, setIsOpen, selectedIndex, setSelectedIndex, options }) => {
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && options.map((opt, i) => (
        <div key={opt.value} onClick={() => { setSelectedIndex(i); setIsOpen(false) }}>
          {opt.label}
        </div>
      ))}
    </div>
  )
}

// Caller must manage state
const [isOpen, setIsOpen] = useState(false)
const [selectedIndex, setSelectedIndex] = useState(-1)
<Dropdown isOpen={isOpen} setIsOpen={setIsOpen} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} options={options} />
```

GOOD:
```typescript
// Internal state encapsulated, caller only cares about value
const Dropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(
    options.findIndex(o => o.value === value)
  )

  const handleSelect = (option, index) => {
    setSelectedIndex(index)
    setIsOpen(false)
    onChange?.(option.value)
  }

  return (
    <div>
      <button onClick={() => setIsOpen(prev => !prev)}>Toggle</button>
      {isOpen && options.map((opt, i) => (
        <div key={opt.value} onClick={() => handleSelect(opt, i)}>
          {opt.label}
        </div>
      ))}
    </div>
  )
}

// Caller only cares about value
<Dropdown options={options} value={selected} onChange={setSelected} />
```

---

## 2. Single Responsibility

"One component, one job"

Component solves only one specific UI/UX problem.

Violation signs:
- Component name contains "And"
- Component fetches data, renders, and handles business logic

BAD:
```typescript
// Component does too many things
const UserProfileAndSettings = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser)
    fetch(`/api/settings/${userId}`).then(r => r.json()).then(setSettings)
  }, [userId])

  const handleSave = async () => {
    await fetch(`/api/settings/${userId}`, { method: 'PUT', body: JSON.stringify(settings) })
    await fetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(user) })
  }

  return (
    <div>
      <h1>{user?.name}</h1>
      <img src={user?.avatar} />
      <input value={settings?.theme} onChange={e => setSettings({ ...settings, theme: e.target.value })} />
      <button onClick={handleSave}>Save All</button>
    </div>
  )
}
```

GOOD:
```typescript
// Split by responsibility
const Avatar = ({ src, alt, size = 'md' }) => (
  <img src={src} alt={alt} className={`avatar avatar--${size}`} />
)

const UserProfile = ({ name, avatar }) => (
  <div className="user-profile">
    <Avatar src={avatar} alt={name} />
    <h1>{name}</h1>
  </div>
)

const ThemeSelector = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
    </SelectContent>
  </Select>
)

// Composition at page/feature level
const SettingsPage = ({ userId }) => {
  const { user } = useUser(userId)
  const { settings, save } = useSettings(userId)

  return (
    <div>
      <UserProfile name={user.name} avatar={user.avatar} />
      <ThemeSelector value={settings.theme} onChange={theme => save({ theme })} />
    </div>
  )
}
```

---

## 3. Stable Interface

"Props as a contract"

Props must be clear, fully typed, self-descriptive. Once published, breaking changes require deprecation warnings.

Violation signs:
- Props named data, config, options without clear meaning
- Changing props without notice

BAD:
```typescript
interface BadButtonProps {
  data: any
  config: object
  handler: Function
  type2: string
  flag: boolean
}

const Button = ({ data, config, handler, type2, flag }: BadButtonProps) => {
  return (
    <button
      style={config as React.CSSProperties}
      disabled={flag}
      onClick={() => handler(data)}
      type={type2 as React.ButtonHTMLAttributes<HTMLButtonElement>['type']}
    >
      {data.label}
    </button>
  )
}
```

GOOD:
```typescript
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 data-icon="inline-start" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

---

## 4. Composability

"Can be assembled"

Component doesn't assume its surrounding context. Supports children, slots, or render props for extension.

Violation signs:
- Component hardcodes parent layout
- Fetches data itself, calls store directly
- Doesn't accept children

BAD:
```typescript
const UserCard = ({ userId }) => {
  const user = useSelector(state => state.users[userId])

  return (
    <div style={{ width: 300, margin: '0 auto', border: '1px solid #ccc' }}>
      <img src={user.avatar} style={{ width: '100%' }} />
      <div style={{ padding: 16 }}>
        <h3>{user.name}</h3>
        <p>{user.bio}</p>
        <button onClick={() => store.dispatch(followUser(userId))}>Follow</button>
      </div>
    </div>
  )
}
```

GOOD:
```typescript
interface UserCardProps {
  avatar: string
  name: string
  bio?: string
  className?: string
  actions?: React.ReactNode
  footer?: React.ReactNode
}

const UserCard = ({ avatar, name, bio, className, actions, footer }: UserCardProps) => {
  return (
    <Card className={cn('user-card', className)}>
      <CardHeader>
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <CardTitle>{name}</CardTitle>
        {bio && <CardDescription>{bio}</CardDescription>}
        {actions && <div className="user-card__actions">{actions}</div>}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

// Caller decides context and behavior
<UserCard
  avatar={user.avatar}
  name={user.name}
  bio={user.bio}
  actions={<Button onClick={() => follow(user.id)}>Follow</Button>}
/>
```

---

## 5. Extensibility

"Can be extended without modification"

Can override styles, inject behavior via props without modifying source.

Violation signs:
- Must fork or modify source to add icon or change style

BAD:
```typescript
const Alert = ({ message, type }) => {
  const colors = { success: 'green', error: 'red', warning: 'orange' }

  return (
    <div style={{ background: colors[type], padding: 12, borderRadius: 4 }}>
      <span>{message}</span>
    </div>
  )
}
```

GOOD:
```typescript
interface AlertProps {
  variant?: 'default' | 'destructive'
  title?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', title, description, icon, onClose, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon}
        <div className="alert__content">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {children}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X data-icon />
          </Button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'
```

---

## 6. Predictability

"Same input → same output"

With same props, component always renders consistent result. No hidden side effects.

Violation signs:
- Component calls API internally
- Mutates global state
- Render result depends on timing

BAD:
```typescript
const PriceTag = ({ productId }) => {
  const [price, setPrice] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${productId}/price`)
      .then(r => r.json())
      .then(data => setPrice(data.price))
  }, [productId])

  return <span>{price ? `$${price}` : 'Loading...'}</span>
}
```

GOOD:
```typescript
interface PriceTagProps {
  price: number | null
  currency?: string
  loading?: boolean
  discountPercent?: number
}

const PriceTag = ({ price, currency = '$', loading = false, discountPercent }: PriceTagProps) => {
  if (loading) return <Skeleton className="h-6 w-20" />
  if (price === null) return null

  const discounted = discountPercent ? price * (1 - discountPercent / 100) : price

  return (
    <div className="price-tag">
      <span className="price-tag__current">
        {currency}{discounted.toLocaleString()}
      </span>
      {discountPercent && (
        <span className="price-tag__original">
          {currency}{price.toLocaleString()}
        </span>
      )}
    </div>
  )
}

// Data fetching outside
const { price, loading } = useProductPrice(productId)
<PriceTag price={price} loading={loading} discountPercent={10} />
```

---

## 7. Testability

"Can be verified independently"

Component can be rendered and asserted without mocking too many things. All UI states can be triggered via props.

Violation signs:
- Must setup store, mock API, wrap multiple Providers to test one small state

BAD:
```typescript
const SubmitButton = () => {
  const { isSubmitting, isValid } = useFormContext()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const handleClick = async () => {
    await submitFormToAPI()
  }

  return (
    <button disabled={!isValid || isSubmitting || !user}>
      {isSubmitting ? t('submitting') : t('submit')}
    </button>
  )
}
```

GOOD:
```typescript
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children?: React.ReactNode
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ loading = false, disabled, children = 'Submit', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        disabled={disabled || loading}
        loading={loading}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
SubmitButton.displayName = 'SubmitButton'

// Testing is extremely simple
it('renders loading state', () => {
  render(<SubmitButton loading />)
  expect(screen.getByRole('button')).toBeDisabled()
})

it('calls onClick when clicked', async () => {
  const onClick = vi.fn()
  render(<SubmitButton onClick={onClick}>Save</SubmitButton>)
  await userEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledOnce()
})
```

---

## 8. Accessibility

"Usable by everyone"

Component works not only with mouse but also with keyboard and screen reader.

Violation signs:
- Uses <div onClick> instead of semantic element
- Missing ARIA attributes
- Doesn't manage focus

BAD:
```typescript
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: 'white', padding: 24 }}>
        <div onClick={onClose} style={{ cursor: 'pointer' }}>✕</div>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
```

GOOD:
```typescript
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

const Modal = ({ open, onOpenChange, title, description, children }: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

---

## How to Use CCP

### When Designing New Component

**Before writing code, ask**:
1. Does this component do one thing? (Single Responsibility)
2. Are props clear enough to use without reading source? (Stable Interface)
3. Is internal state exposed? (Encapsulation)
4. Can it be extended without modifying source? (Extensibility)
5. Can all UI states be controlled via props? (Testability)
6. Can it fit into different contexts? (Composability)
7. Same props → same output? (Predictability)
8. Does it work with keyboard and screen reader? (Accessibility)

### When Reviewing PR

Ask **which principle is violated**, not "is this code correct".

### When Refactoring

Use as **diagnostic tool** — identify which principle is "sick" and refactor from there.

---

## Quick Diagnostic

| Symptom | Violated Principle | Fix |
|---------|-------------------|-----|
| Must read source to use | Encapsulation | Hide internal state |
| Component does too much | Single Responsibility | Split into smaller components |
| Props unclear | Stable Interface | Add types, better names |
| Can't reuse elsewhere | Composability | Remove hardcoded context |
| Must fork to customize | Extensibility | Add props for customization |
| Different output with same props | Predictability | Move side effects outside |
| Hard to test | Testability | Control state via props |
| Doesn't work with keyboard | Accessibility | Add semantic HTML, ARIA |
