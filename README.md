# gucci

quickstart:

```bash
bun create spirobel/gucci yournewproject
```

barebones quickstart:

```bash
bun create spirobel/aldi yournewproject
```

if you don't have bun installed, run first:

```bash
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

To install dependencies:

```bash
bun install
```

dev:

```bash
bun run dev
```

production:

```bash
bun run start
```

build:

```bash
bun run build
```

migrations:

```bash
bun run db:mm # to make migrations, after editing the schema.ts file
bun run db:migrate
```

## Tutorial

If you understand these 3 basic concepts you can build your own website with mininext:

1. html + css
2. templating
3. you can use data inside of your html templates

Tutorial video: [intro to mininext](https://www.youtube.com/watch?v=rz4awKntpzE)
