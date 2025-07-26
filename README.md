# Startup Gen

<div align="center">

A CLI tool for early-stage startups to create your startup. This tool helps entrepreneurs systematically approach building their startup using proven lean startup principles.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

</div>

## ✨ Features

- **📱 Finding Product-Market Fit**: Find your product-market fit in a structured way
- **🧍 Finding Co-Founders**: Find potential co-founders that are aligned with your vision and values

## Installation

```
npm install -g startup-gen
```

## Usage

1. Create a folder for your new startup

```
mkdir my-unicorn
cd my-unicorn
```

2. Run Startup Gen

```
startup
```

## Requirements

- Node.js 16+
- OpenAI API key for customer segment generation

## Tech Stack
- TypeScript
- [ink](https://github.com/vadimdemedes/ink)

## Development

Run the development server with a different directory than the current one:

```
npm run dev -- -d "../any-startup"
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests if applicable
4. Run `npm test` and `npm run lint` to ensure quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure your PR includes:
- Clear description of changes
- Tests for new functionality
- Updated documentation if needed

## License

MIT
