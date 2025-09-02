
# HTML 3D Panorama


https://github.com/user-attachments/assets/3f692021-8561-4aad-85d3-c423ee43cd7b

This project is a web-based 3D panorama viewer built using HTML, CSS, and JavaScript. It allows users to view and interact with panoramic images in a 3D sphere format. The user can rotate the image in all directions for a better viewing experience. This is a lightweight solution for showcasing panoramic images or videos with interactive 3D effects.

## Features

- **360° Panoramic View**: View images in a 360-degree panoramic view with touch or mouse interaction.
- **3D Rendering**: Uses WebGL and Three.js for rendering the panoramic images onto a 3D sphere.
- **Responsive Design**: Supports different screen sizes, making it accessible across various devices.
- **Touch and Mouse Interactions**: Rotate the panorama by clicking and dragging or using touch gestures.

## Demo

You can check out the live demo of the 3D panorama viewer at the [GitHub Pages link](https://xinli7572.github.io/html_3d_panorama/).

## Setup and Usage

To set up and run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/xinli7572/html_3d_panorama.git
```


### 2. Open `index.html` in a Web Browser

Once you've cloned the repository, you can open the `index.html` file in any modern web browser (Chrome, Firefox, etc.) to start the panorama viewer.

### 3. Customize the Panorama Image

To change the panorama image, simply replace the `e.mp4` file in the root folder with your own video. Ensure the new video is properly mapped to the sphere.

## How It Works

The 3D panorama viewer is built with the following technologies:

- **HTML**: Provides the basic structure of the page.
- **CSS**: Used for styling and making the viewer responsive.
- **JavaScript**: Contains the logic for rendering and interacting with the panorama.
- **Three.js**: A 3D graphics library used to render the panoramic image onto a 3D sphere.

### JavaScript Details

The JavaScript code uses **OpenGL** to map the panoramic image onto a sphere. The user can rotate the sphere using mouse or touch events. 

### Key Functions:

- **initScene**: Initializes the 3D scene, including setting up the camera, renderer, and lights.
- **createSphere**: Creates the 3D sphere that the panorama image is mapped onto.
- **animate**: Continuously renders the scene and updates the rotation based on user interaction.

## Customization

You can easily customize the following aspects of the panorama viewer:

- **Panorama Image**: Replace the image in the `e.mp4` folder with your own video.
- **Sphere Settings**: Adjust the radius, texture mapping, and other properties of the sphere in the `panorama.js` file.
- **Lighting**: Modify the lighting settings in the scene to improve visibility or create a different ambiance.

## Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript**
- **WebGL** (3D Graphics Library)

## Contributions

Feel free to fork this repository and contribute to the project! You can:

- Fix bugs or improve performance.
- Add new features or enhancements.
- Improve documentation or the user interface.













