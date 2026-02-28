# [Teach Anything](https://www.teach-anything.com/)

Teach you anything in seconds use AI.

https://user-images.githubusercontent.com/2337506/216798367-2b5e3bc7-5cbd-4173-9ea7-0e1e85ea87dc.mov

## Sponsor

<table>
  <tr>
    <td>
      <a href="https://magickpen.com/" target="_blank">
        <img alt="MagickPen" src="https://www.teach-anything.com/magickpen.svg" height="32px;" />
      </a>
    </td>
    <td>
      <a href="https://better.avatarprompt.net/" target="_blank">
        <img alt="BetterPrompt" src="https://www.teach-anything.com/BetterPrompt.png" height="32px;" />
      </a>
    </td>
    <td>
      <a href="https://openl.io/" target="_blank">
        <img alt="OpenL" src="https://www.teach-anything.com/OpenL.png" height="32px;" />
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://talentorg.com.cn/" target="_blank">
        <img alt="Talentorg" src="https://www.teach-anything.com/talentorg.svg" height="32px;" />
      </a>
    </td>
    <td>
      <a href="https://sailboatui.com/?ref=teach-anything" target="_blank">
        <img alt="SailboatUI" src="public/sailboatui.svg" height="32px;" />
      </a>
    </td>
    <td>
      <a href="https://www.buymeacoffee.com/lvwzhen" target="_blank"> ❤️ Your logo </a>
    </td>
  </tr>
</table>

## Language support
`English`, `Simplified Chinese`, `Traditional Chinese`, `Japanese`, `Italian`, `German`, `Spanish`,`French`,`Dutch` ,`Korean`,`Khmer`, `Hindi`

PR welcome

## How it works

Inspired by [TwtterBio](https://github.com/Nutlope/twitterbio) and [Danny Richman](https://twitter.com/DannyRichman/status/1598254671591723008?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1598254671591723008%7Ctwgr%5Eb7deab6eb03d86a1b9ac13f7e38cdeab57a40cbb%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Fwww.buzzfeednews.com%2Farticle%2Ftomwarren%2Fai-app-dyslexic-email-writer-help)

Powered by [OpenAI](https://openai.com/), [Next.js](https://nextjs.org/), [Cloudflare Workers](https://workers.cloudflare.com/) and [Tailwind CSS](https://tailwindcss.com/).

This project uses the OpenAI Chat Completions API with streaming. It constructs a prompt based on the form and user input, sends it to `/api/generate`, then streams the response back to the application.

The app is deployed on Cloudflare using [OpenNext for Cloudflare](https://opennext.js.org/cloudflare).

## Running Locally

Create a `.env` file based on `.env.example`:

```bash
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=your_openai_base_url
OPENAI_MODEL=your_openai_model
```

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## Deploy to Cloudflare Workers

Install dependencies:

```bash
npm install
```

Login to Cloudflare:

```bash
npx wrangler login
```

Set Cloudflare runtime variables in dashboard:

- `OPENAI_API_KEY` (Secret)
- `OPENAI_MODEL` (Variable or Secret, optional override)
- `OPENAI_BASE_URL` (Variable or Secret, optional override)

Or via CLI:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_MODEL
npx wrangler secret put OPENAI_BASE_URL
```

Build and preview on the Cloudflare runtime:

```bash
npm run build:cf
npm run preview:cf
```

Deploy:

```bash
npm run deploy:cf
```
