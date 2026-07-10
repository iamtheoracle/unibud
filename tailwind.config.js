/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: '0.75rem',
  			sm: '0.5rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem'
  		},
  		spacing: {
  			'15': '3.75rem',
  			'30': '7.5rem',
  			'40': '10rem',
  			'48': '12rem',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
        gold: 'hsl(var(--unibud-gold))',
        black: 'hsl(var(--unibud-black))',
        white: 'hsl(var(--unibud-white))',
        n1: 'hsl(var(--unibud-n1))',
        n2: 'hsl(var(--unibud-n2))',
        n3: 'hsl(var(--unibud-n3))',
        n4: 'hsl(var(--unibud-n4))',
        n5: 'hsl(var(--unibud-n5))',
        n6: 'hsl(var(--unibud-n6))',
        n7: 'hsl(var(--unibud-n7))',
        blue: 'hsl(var(--unibud-blue))',
        purple: { DEFAULT: 'hsl(var(--unibud-purple))', foreground: 'hsl(var(--unibud-purple-foreground))' },
        success: { DEFAULT: 'hsl(var(--unibud-green))', foreground: 'hsl(var(--unibud-green-foreground))' },
        warning: { DEFAULT: 'hsl(var(--unibud-orange))', foreground: 'hsl(var(--unibud-orange-foreground))' },
        error: { DEFAULT: 'hsl(var(--unibud-red))', foreground: 'hsl(var(--unibud-red-foreground))' },
        info: { DEFAULT: 'hsl(var(--unibud-blue))', foreground: 'hsl(var(--unibud-blue-foreground))' },
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'float-in': 'float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
