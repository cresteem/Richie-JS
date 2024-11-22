<div align="center">

![Richie JS logo](./logo/logo.png)

# Richie JS - Powerful SEO Tool for Generating Rich Results AKA Schema markups

<p id="intro">
Richie JS is an advanced SEO toolkit that simplifies the creation of structured data for rich results, enhancing your website's visibility and performance on search engines. By automating the generation of JSON-LD schema, it accelerates SEO optimization, improves search engine rankings, and boosts user engagement with minimal effort.
</p>


### Supported Platforms

[![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)]()  
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)]()  
[![Node JS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)]()

### Supported browsers
![Brave](https://img.shields.io/badge/Brave-FB542B?style=for-the-badge&logo=Brave&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)
![Opera](https://img.shields.io/badge/Opera-FF1B2D?style=for-the-badge&logo=Opera&logoColor=white)

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

Richie JS empowers developers with an efficient toolset for generating SEO-friendly structured data. Here's what makes Richie JS stand out:

### Core Features:
- **Automated Rich Results Generation:** Automatically generate structured data (JSON-LD) compliant with Google’s rich results standards.
- **Wide Schema Support:** Supports multiple schema types like breadcrumbs, FAQs, and site search boxes to cater to diverse SEO needs.
- **Cross-Environment Compatibility:** Works seamlessly in both **Node.js** and **client-side** environments, providing flexibility for all project types.
- **Lightweight and Optimized:** Richie JS is designed to minimize dependencies and overhead, ensuring fast performance.
- **Configurable and Customizable:** Define configurations with ease using `richiejs.config.js`, and leverage TypeScript types for intelligent support.
- **Intuitive CLI Application:** Generate and deploy structured data through an easy-to-use Command Line Interface.

### Latest Enhancements - Version 2.0.0:
- **Config File Enhancement:** Migrated to `richiejs.config.js` for improved customization and better developer experience, including TypeScript IntelliSense support.
- **Expanded API Functionality:** Richie JS API now supports handling an array of schemas, enabling advanced structured data strategies.
- **Performance Optimization:** Removed dependencies (`axios` and `mkdirp`) and replaced them with built-in `fetch` and `mkdirSync` to save bytes and improve efficiency.
- **Enhanced CLI Features:** 
  - New `init` command to create templates and auto-infer breadcrumb and site search box schema markup.
  - Improved usability and optimizations for faster and seamless operation.
- **Linux Path Fixes:** Resolved breadcrumb issues specific to Linux environments.
- **Richie.js Branding:** Added an official Richie JS logo and a dedicated icon in VS Code for an enhanced developer experience.
- **Cross-Environment Compatibility Notice:** Richie JS now fully supports **both client-side and Node.js environments**, making it versatile for a variety of use cases.
- **Browser-Side Note:** While breadcrumb support is currently server-side only, other schema types work seamlessly in browser environments.

With its robust features, Richie JS simplifies the implementation of structured data, ensuring optimal SEO performance while providing a smooth development experience.

## Use Cases ✅

* **SEO Specialists:** Effortlessly generate rich snippets for client websites, improving search rankings.
* **Web Developers:** Integrate structured data into websites without complex coding.
* **Digital Marketers:** Enhance website visibility and drive engagement through optimized SEO practices.
* **Content Managers:** Automatically generate SEO-friendly structured data for blog posts and articles.
* **E-commerce Platforms:** Improve product visibility in search results by incorporating rich snippets.
* **Agencies and Freelancers:** Quickly deliver SEO enhancements to client projects.

---

### 🙏🏻 Support Richie.js and Help It Grow  

Every **star** on this repository is a symbol of encouragement and a testament to the value Richie.js brings to its users. If this tool has simplified your SEO efforts or improved your workflow, **please consider showing your support by giving it a star** ⭐ — it only takes a second!  

But why stop there? If Richie.js has been especially useful in your projects, consider **sponsoring the development** to help us keep improving, innovating, and supporting the community.  

💡 *The "Star" button is at the top-right of the page, near the repository name.*  

Your support, whether through a star or sponsorship, fuels our passion and drives us to build even better tools for everyone. Thank you for being part of the journey! 🌟✨

---

## Installation - Step-by-Step Guide 🪜

Refer below link:  
[Getting Started](https://richiejs.cresteem.com/getting-started-with-richie-js)

## Usage

Complete usage documentation is available here: [Richie.js Documentation](https://richiejs.cresteem.com/)

### Generate a rich result
```bash
rjs make
```

### Store output in a specific directory
```bash
rjs make -d <destinationFolder>
```

### Exclude specific files and folders
```bash
rjs make -o <relativePath/subpath>
```

### ⚙️🛠️ Custom Configuration
```bash
rjs init
```
Now you can configure your settings inside `richiejs.config.js` file.

---

## License ©️

This project is licensed under the [Apache License 2.0](LICENSE).

---

## Contributing to Our Project 🤝

We’re always open to contributions and fixing issues—your help makes this project better for everyone.  

If you encounter any errors or issues, please don’t hesitate to [raise an issue](../../issues/new).  

---

## Website 🌐

<a id="url" href="https://richiejs.cresteem.com">richiejs.cresteem.com</a>

---

## Contact Information

For any questions, please reach out via connect@cresteem.com

---

## Credits 🙏🏻

Richie JS is an open-source project developed and maintained by [DARSAN](https://darsan.in/) at [CRESTEEM](https://www.cresteem.com/). Special thanks to the creators and maintainers of the foundational libraries.

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
<li>search optimization</li>
<li>website visibility</li>
<li>developer tools</li>
<li>cli tools</li>
<li>digital marketing</li>
<li>seo tool</li>
<li>rich results</li>
<li>structured data</li>
<li>schema markup</li>
<li>content optimization</li>
<li>richie js</li>
</ul>
