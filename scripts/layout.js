document.body.insertAdjacentHTML('afterbegin', `
    <div class="app-header__wrapper">
        <header class="app-header">
            <h1>Web Labs Launcher</h1>

            <img src="../../assets/images/icons/css_icon.png" alt="css" class="skill-item">
            <img src="../../assets/images/icons/html_icon.png" alt="html" class="skill-item">
            <img src="../../assets/images/icons/js_icon.png" alt="js" class="skill-item">
            <img src="../../assets/images/icons/nodejs_icon.png" alt="nodejs" class="skill-item">
            <img src="../../assets/images/icons/git_icon.png" alt="git" class="skill-item">
            <img src="../../assets/images/icons/figma_icon.png" alt="figma" class="skill-item">
            <img src="../../assets/images/icons/typescript_icon.png" alt="typescript" class="skill-item">
            <img src="../../assets/images/icons/angular_icon.png" alt="angular" class="skill-item">
            <img src="../../assets/images/icons/react_icon.png" alt="react" class="skill-item">
            <img src="../../assets/images/icons/vue_icon.png" alt="vue" class="skill-item">
            <img src="../../assets/images/icons/github_icon.png" alt="github" class="skill-item">

            <p class="app-header__description">quickly launch any lab</p>
        </header>

        <a href="../../index.html" class="app-header__logo">
            <img src="../../assets/images/images/app_logo.png" alt="app logo">
        </a>

        <div class="app-header__link__wrapper">
                <a href="www.linkedin.com/in/anton-filiuta-336951314" class="app-header__link" data-link-type="linkedin">
                    <img src="../../assets/images/icons/linkedin_link_icon.png" alt="linkedin link">
                </a>

                <a href="https://github.com/antonfiluta" class="app-header__link" data-link-type="github"> 
                    <img src="../../assets/images/icons/github_link_icon.png" alt="github link">
                </a>
            </div>
    </div>
`);

document.body.insertAdjacentHTML('beforeend', `
    <footer>Links to other labs in future</footer>
    <div class="sky-container">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star large"></div>
        <div class="star small"></div>
    </div>
`);