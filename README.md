<div align="center">

![Richi JS logo](./logo/logo.png)

# Richie JS - Powerful SEO Tool for Generating Rich Results

<p id="intro">Richie JS is a powerful SEO tool designed to streamline the creation of structured data for rich results, boosting your website's visibility on search engines. It automates the generation of JSON-LD output, enabling quick and efficient optimization for search engine performance and enhancing user engagement.</p>


### Supported Platforms


[![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)]()
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)]()
[![Node JS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)]()


---


<p>

<span>
  <a href="https://github.com/cresteem/Richie-JS/commits/main">
    <img src="https://img.shields.io/github/last-commit/cresteem/Richie-JS?display_timestamp=committer&style=for-the-badge&label=Updated%20On" alt="GitHub last commit"/>
  </a>
</span>

<span>
  <a href="">
    <img src="https://img.shields.io/github/commit-activity/m/cresteem/Richie-JS?style=for-the-badge&label=Commit%20Activity" alt="GitHub commit activity"/>
  </a>
</span>

</p>

<p>

<span>
  <a href="https://github.com/cresteem/Richie-JS/actions/workflows/test.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/cresteem/Richie-JS/test.yaml?style=for-the-badge&label=Test%20Status" alt="GitHub Actions Test Status"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/cresteem/Richie-JS?style=for-the-badge&label=License" alt="GitHub License"/>
  </a>
</span>

<span>
  <a href="https://github.com/cresteem/Richie-JS/releases">
    <img src="https://img.shields.io/github/v/release/cresteem/Richie-JS?sort=date&display_name=tag&style=for-the-badge&label=Latest%20Version" alt="GitHub Release"/>
  </a>
</span>

</p>

<p>

<span>
  <a href="https://www.codefactor.io/repository/github/cresteem/Richie-JS/issues/main">
    <img src="https://img.shields.io/codefactor/grade/github/cresteem/Richie-JS?style=for-the-badge&label=Code%20Quality%20Grade" alt="CodeFactor Grade"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="">
    <img src="https://img.shields.io/npm/d18m/%40cresteem%2Frichie-js?style=for-the-badge&label=Downloads%20On%20NPM" alt="NPM Downloads"/>
  </a>
</span>

<span>
  <a href="">
    <img src="https://img.shields.io/github/stars/cresteem/Richie-JS?style=for-the-badge&label=Stars" alt="GitHub Repo stars"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="https://github.com/sponsors/darsan-in">
    <img src="https://img.shields.io/github/sponsors/darsan-in?style=for-the-badge&label=Generous%20Sponsors" alt="GitHub Sponsors"/>
  </a>
</span>

</p>

---

</div>

## Table of Contents 📝

- [Features and Benefits](#features-and-benefits-)
- [Use Cases](#use-cases-)
- [Friendly request to users](#-friendly-request-to-users)

- [Installation - Step-by-Step Guide](#installation---step-by-step-guide-)
- [Usage](#usage)

- [License](#license-%EF%B8%8F)
- [Contributing to Our Project](#contributing-to-our-project-)
- [Website](#website-)

- [Contact Information](#contact-information)
- [Credits](#credits-)

## Features and Benefits ✨

* **Automated Rich Results Generation:** Automate the creation of rich snippets with minimal manual effort.
* **Google-Recognized Structured Data:** Generates JSON-LD outputs that comply with Google’s rich results standards.
* **Customizable Configuration:** Easily tailor output and settings through the `.richiejs` file.
* **Improved SEO Performance:** Boost your website’s visibility and user engagement by integrating rich snippets.
* **Command-Line Interface (CLI) Support:** Offers powerful CLI commands for streamlined operations.
* **Open-Source Flexibility:** Licensed under Apache 2.0, allowing free use and modification in projects.

## Use Cases ✅
* **SEO Specialists:** Effortlessly generate rich snippets for client websites, improving search rankings.
* **Web Developers:** Integrate structured data into websites without complex coding.
* **Digital Marketers:** Enhance website visibility and drive engagement through optimized SEO practices.
* **Content Managers:** Automatically generate SEO-friendly structured data for blog posts and articles.
* **E-commerce Platforms:** Improve product visibility in search results by incorporating rich snippets.
* **Agencies and Freelancers:** Quickly deliver SEO enhancements to client projects.

---

### 🙏🏻 Friendly Request to Users

Every star on this repository is a sign of encouragement, a vote of confidence, and a reminder that our work is making a difference. If this project has brought value to you, even in the smallest way, **please consider showing your support by giving it a star.** ⭐

_"Star" button located at the top-right of the page, near the repository name._

Your star isn’t just a digital icon—it’s a beacon that tells us we're on the right path, that our efforts are appreciated, and that this work matters. It fuels our passion and drives us to keep improving, building, and sharing.

If you believe in what we’re doing, **please share this project with others who might find it helpful.** Together, we can create something truly meaningful.

Thank you for being part of this journey. Your support means the world to us. 🌍💖

---

## Installation - Step-by-Step Guide 🪜
Refer below link:

[Getting Started](https://richiejs.cresteem.com/getting-started-with-richie-js)

## Usage

Everything from top to bottom of Richie JS available here - https://richiejs.cresteem.com/

### Generate a rich result
```bash
npx rjs make
```

### Store output in a specific directory
```bash
npx rjs make -d <destinationFolder>
```

### Exclude specific files and folders
```bash
npx rjs make --no <relativePath/subpath>
```

**⚠️ By default, Richie JS removes previous outputs or clears the destination directory.**

### To preserve existing files, use the `--norm` or `-p` flag:
```bash
npx rjs make -p
# or
npx rjs make --norm
```

### ⚙️🛠️ Custom Configuration
Override default settings by creating an `.richiejs` file in the project's root directory.

### 🤖 Setting Up IntelliSense for Richie JS
**⚠️ Only for VS Code**

#### Option 1: System-wide IntelliSense support
```bash
npx rjs isense user
```

#### Option 2: Project-specific IntelliSense support
```bash
npx rjs isense ws
```

## License ©️

This project is licensed under the [Apache License 2.0](LICENSE).

## Contributing to Our Project 🤝

We’re always open to contributions and fixing issues—your help makes this project better for everyone.

If you encounter any errors or issues, please don’t hesitate to [raise an issue](../../issues/new). This ensures we can address problems quickly and improve the project.

For those who want to contribute, we kindly ask you to review our [Contribution Guidelines](CONTRIBUTING) before getting started. This helps ensure that all contributions align with the project's direction and comply with our existing [license](LICENSE).

We deeply appreciate everyone who contributes or raises issues—your efforts are crucial to building a stronger community. Together, we can create something truly impactful.

Thank you for being part of this journey!

## Website 🌐

<a id="url" href="https://richiejs.cresteem.com">richiejs.cresteem.com</a>

## Contact Information

For any questions, please reach out via connect@cresteem.com

## Credits 🙏🏻

Richie JS is an open-source project developed and maintained by [DARSAN](https://darsan.in/) at [CRESTEEM](https://www.cresteem.com/). Special thanks to the creators and maintainers of the foundational libraries used, including [Cheerio](https://cheerio.js.org/), [Puppeteer](https://pptr.dev/), and [Yargs](https://yargs.js.org/).

---

<p align="center">
  <a href="https://cresteem.com/">
    <img src="https://darsan.in/readme-src/branding-gh.png" alt="Cresteem Logo">
  </a>
</p>

---

<p align="center">

<span>
<a href="https://www.instagram.com/cresteem/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/insta.png" alt="Cresteem at Instagram"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://www.linkedin.com/company/cresteem/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/linkedin.png" alt="Cresteem at Linkedin"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://x.com/cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/x.png" alt="Cresteem at Twitter / X"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://www.youtube.com/@Cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/youtube.png" alt="Cresteem at Youtube"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://github.com/cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/github.png" alt="Cresteem at Github"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://cresteem.com/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/website.png" alt="Cresteem Website"></a>
</span>

</p>

---


#### Topics
<ul id="keywords">
<li>seo automation</li>
<li>google snippets</li>
<li>web development</li>
<li>seo</li>
<li>website visibility</li>
<li>developer tools</li>
<li>cli tools</li>
<li>digital marketing</li>
<li>seo tool</li>
<li>rich results</li>
<li>json-ld</li>
<li>structured data</li>
<li>schema markup</li>
</ul>
