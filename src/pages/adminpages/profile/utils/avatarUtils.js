/**
 * Avatar Utilities
 * Helper functions for generating and managing user avatars
 */

/**
 * Generate avatar image from user's initial
 * @param {string} initial - First letter of user's name
 * @param {Object} options - Customization options
 * @returns {string} Data URL of the generated image
 */
export const generateImageFromInitial = (initial, options = {}) => {
    const {
        size = 100,
        backgroundColor = '#f3f4f6',
        textColor = '#333',
        fontSize = 50,
        fontFamily = 'Arial'
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Set background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the initial in the center
    ctx.fillText(initial.toUpperCase(), canvas.width / 2, canvas.height / 2);

    // Return the data URL of the image
    return canvas.toDataURL();
};

/**
 * Get initials from user's first and last name
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} Initials (e.g., "JD" for John Doe)
 */
export const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'U';
};

/**
 * Generate random background color for avatar
 * @returns {string} Hex color code
 */
export const generateRandomAvatarColor = () => {
    const colors = [
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#10B981', // Green
        '#3B82F6', // Blue
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};
