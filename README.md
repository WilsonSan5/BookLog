# 📚 BookLog

A modern, responsive web application for managing your personal book collection. Built with vanilla JavaScript and styled with Tailwind CSS.

![BookLog Screenshot](./screenshots/main-interface.png)

## ✨ Features

- **📖 Book Management**: Add, view, edit, and delete books from your personal library
- **🔍 Detailed View**: Rich modal interface displaying comprehensive book information
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean interface built with Tailwind CSS
- **⌨️ Keyboard Navigation**: Full keyboard support including ESC key to close modals
- **🚀 Fast Performance**: Lightweight vanilla JavaScript implementation
- **💾 Local Storage**: Persistent data storage in the browser

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Architecture**: Modular JavaScript with ES6 imports/exports
- **Storage**: Browser LocalStorage API

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6+ support
- Basic web server (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BookLog.git
   cd BookLog
   ```

2. **Serve the application**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js (if you have `serve` installed):
   ```bash
   npx serve .
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 📖 Usage

### Adding Books
1. Click the "Add Book" button
2. Fill in the book details (title, author, publication date, pages, description)
3. Click "Save" to add the book to your collection

### Viewing Book Details
1. Click on any book card in your collection
2. A detailed modal will open showing all book information
3. Use the close button, ESC key, or click outside the modal to close

### Managing Your Collection
- **Edit**: Click the edit icon on any book card
- **Delete**: Click the delete icon to remove a book
- **Search**: Use the search functionality to find specific books

## 📁 Project Structure

```
BookLog/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Custom styles and Tailwind imports
├── js/
│   ├── app.js             # Main application logic
│   ├── book-detail.js     # Modal and book detail functionality
│   ├── book-manager.js    # Book CRUD operations
│   └── storage.js         # LocalStorage utilities
├── assets/
│   ├── images/            # Project images and icons
│   └── screenshots/       # Application screenshots
└── README.md              # Project documentation
```

## 🔧 Key Components

### Book Detail Modal (`js/book-detail.js`)
- Responsive modal system for displaying detailed book information
- Keyboard navigation support (ESC to close)
- Click-outside-to-close functionality
- Smooth animations and transitions

### Book Management System
- CRUD operations for book data
- LocalStorage integration for data persistence
- Validation and error handling

### Responsive Design
- Mobile-first approach using Tailwind CSS
- Adaptive grid layouts
- Touch-friendly interface elements

## 🎨 UI/UX Features

- **Clean Interface**: Minimalist design focused on readability
- **Smooth Animations**: CSS transitions for better user experience
- **Accessibility**: Proper semantic HTML and keyboard navigation
- **Mobile Responsive**: Optimized for all screen sizes
- **Visual Feedback**: Hover states and interactive elements

## 🔮 Future Enhancements

- [ ] Book cover image upload and display
- [ ] Advanced search and filtering options
- [ ] Book categories and tags
- [ ] Reading progress tracking
- [ ] Export/import functionality
- [ ] Dark mode theme
- [ ] Book recommendations
- [ ] Integration with book APIs (Google Books, etc.)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Code Style

- Use ES6+ JavaScript features
- Follow consistent indentation (2 spaces)
- Add comments for complex functionality
- Ensure responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and version information

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/BookLog](https://github.com/yourusername/BookLog)

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful SVG icons
- Inspiration from modern book management applications

---

⭐ If you found this project helpful, please give it a star on GitHub!
