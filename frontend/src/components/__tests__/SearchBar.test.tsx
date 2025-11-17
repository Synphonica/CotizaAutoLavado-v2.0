/**
 * Tests para el componente SearchBar
 */

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

// Mock framer-motion para evitar problemas en tests
jest.mock('framer-motion', () => ({
    motion: {
        form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    },
}))

describe('SearchBar', () => {
    it('should render search input and button', () => {
        render(<SearchBar />)

        const input = screen.getByPlaceholderText(/Ej: Lavado premium/i)
        const button = screen.getByRole('button', { name: /buscar/i })

        expect(input).toBeInTheDocument()
        expect(button).toBeInTheDocument()
    })

    it('should have default action attribute', () => {
        const { container } = render(<SearchBar />)
        const form = container.querySelector('form')

        expect(form).toHaveAttribute('action', '/results')
    })

    it('should accept custom action prop', () => {
        const { container } = render(<SearchBar action="/search-results" />)
        const form = container.querySelector('form')

        expect(form).toHaveAttribute('action', '/search-results')
    })

    it('should update input value when typing', async () => {
        const user = userEvent.setup()
        render(<SearchBar />)

        const input = screen.getByPlaceholderText(/Ej: Lavado premium/i) as HTMLInputElement

        await user.type(input, 'lavado de auto')

        expect(input.value).toBe('lavado de auto')
    })

    it('should render with initial query', () => {
        render(<SearchBar initialQuery="lavado premium" />)

        const input = screen.getByPlaceholderText(/Ej: Lavado premium/i) as HTMLInputElement

        expect(input.value).toBe('lavado premium')
    })

    it('should have search icon in button', () => {
        const { container } = render(<SearchBar />)

        // Lucide icons render as SVG
        const svgs = container.querySelectorAll('svg')
        expect(svgs.length).toBeGreaterThan(0)
    })

    it('should submit form when button clicked', () => {
        const mockSubmit = jest.fn((e) => e.preventDefault())
        const { container } = render(<SearchBar />)
        const form = container.querySelector('form')!

        form.onsubmit = mockSubmit

        const button = screen.getByRole('button', { name: /buscar/i })
        fireEvent.click(button)

        expect(mockSubmit).toHaveBeenCalled()
    })

    it('should have correct input name attribute', () => {
        render(<SearchBar />)

        const input = screen.getByPlaceholderText(/Ej: Lavado premium/i)

        expect(input).toHaveAttribute('name', 'q')
    })
})
