import { ColorResult } from "react-color";

export const RGBAToRust = (color: ColorResult): string => {
    if (color && color.rgb) {
        const { r, g, b, a } = color.rgb;
        return `${r / 255} ${g / 255} ${b / 255} ${a}`;
    } else {
        throw new Error("Invalid color format");
    }
}

export const rustToRGBA = (rustColor: string): string => {
    const colorValues = rustColor.split(" ").map(Number);
    if (colorValues.length !== 4 || colorValues.some(isNaN)) {
        throw new Error("Invalid Rust color format");
    }

    const [r, g, b, a] = colorValues;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

export const rustToHex = (rustColor: string): string => {
    const colorValues = rustColor.split(" ").map(Number);
    if (colorValues.length !== 4 || colorValues.some(isNaN)) {
        throw new Error("Invalid Rust color format");
    }

    const [r, g, b, a] = colorValues;
    // Преобразуем r, g, b в диапазон 0-255 и округляем
    const rHex = Math.round(r * 255).toString(16).padStart(2, '0');
    const gHex = Math.round(g * 255).toString(16).padStart(2, '0');
    const bHex = Math.round(b * 255).toString(16).padStart(2, '0');
    
    // Преобразуем a в диапазон 0-255 и округляем, добавляем к HEX
    const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
    
    // Возвращаем HEX формат с альфа-каналом если a < 1
    return `#${rHex}${gHex}${bHex}${aHex}`;
}