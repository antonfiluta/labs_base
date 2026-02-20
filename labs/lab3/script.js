function updateSelectedParams() {
    document.getElementById('show-caption').textContent = 
        document.getElementById('caption').value;
    document.getElementById('show-width').textContent = 
        document.getElementById('width').value + 'px';
    document.getElementById('show-border').textContent = 
        document.getElementById('border-color').selectedOptions[0].text;
    document.getElementById('show-opacity').textContent = 
        document.getElementById('opacity').selectedOptions[0].text;
    document.getElementById('show-image').textContent = 
        document.getElementById('image').selectedOptions[0].text;
}

function buildImageUrl() {
    const caption = encodeURIComponent(document.getElementById('caption').value);
    const width = document.getElementById('width').value;
    const borderColor = encodeURIComponent(document.getElementById('border-color').value);
    const opacity = document.getElementById('opacity').value;
    const imageKey = document.getElementById('image').value;
    
    return `image-preview.html?caption=${caption}&width=${width}&border=${borderColor}&opacity=${opacity}&image=${imageKey}`;
}

function generateImage() {
    const url = buildImageUrl();
    window.open(url, '_blank');
    updateSelectedParams();
}

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', generateImage);
    
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', updateSelectedParams);
    });
    
    updateSelectedParams();
});