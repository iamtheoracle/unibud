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
        '3xl': '2.25rem',
        pill: '9999px'
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
  			card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  			popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
  			primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  			secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  			muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  			accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
  			destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
  			success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
  			warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' },
  			error: { DEFAULT: 'hsl(var(--error))', foreground: 'hsl(var(--error-foreground))' },
  			information: { DEFAULT: 'hsl(var(--information))', foreground: 'hsl(var(--information-foreground))' },
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
        ice: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        gold: { DEFAULT: 'hsl(var(--gold))', foreground: '0 0% 100%' },
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
  		fontSize: {
  			display: ['var(--text-display)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  			heading: ['var(--text-heading)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  			title: ['var(--text-title)', { lineHeight: '1.25' }],
  			subtitle: ['var(--text-subtitle)', { lineHeight: '1.3' }],
  			body: ['var(--text-body)', { lineHeight: '1.5' }],
  			caption: ['var(--text-caption)', { lineHeight: '1.4' }],
  			label: ['var(--text-label)', { lineHeight: '1.3', letterSpacing: '0.01em' }],
  			micro: ['var(--text-micro)', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  		},
  		keyframes: {
        'float-in': { '0%': { opacity: '0', transform: 'translateY(16px) scale(0.97)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } }
  		},
  		animation: {
        'float-in': 'float-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
