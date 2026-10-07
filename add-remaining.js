const db = require("./config/db");

const foods = [

    // =========================
    // RICE
    // =========================

    ["Rice", "Plain/Steamed Rice", 80],
    ["Rice", "Bagara Rice", 150],
    ["Rice", "Jeera Rice", 100],
    ["Rice", "Ghee Rice", 120],
    ["Rice", "Lemon Rice", 100],
    ["Rice", "Tomato Rice", 100],
    ["Rice", "Curd Rice", 100],
    ["Rice", "Sambar Rice", 150],
    ["Rice", "Rasam Rice", 150],
    ["Rice", "Curry Leaf Rice", 200],
    ["Rice", "Avakai Rice", 200],
    ["Rice", "Gun Powder Rice", 200],
    ["Rice", "Veg Fried Rice", 130],
    ["Rice", "Schezwan Veg Fried Rice", 150],
    ["Rice", "Egg Fried Rice", 150],
    ["Rice", "Chicken Fried Rice", 160],
    ["Rice", "Schezwan Chicken Fried Rice", 180],
    ["Rice", "Prawns Fried Rice", 300],
    ["Rice", "Veg Pulao", 140],
    ["Rice", "Paneer Pulao", 250],
    ["Rice", "Kaju Pulao", 300],
    ["Rice", "Corn Pulao", 300],
    ["Rice", "Mushroom Pulao", 300],
    ["Rice", "Egg Pulao", 180],
    ["Rice", "Chicken Pulao", 200],
    ["Rice", "Gongura Chicken Pulao", 250],
    ["Rice", "Ulavacharu Chicken Pulao", 250],
    ["Rice", "Mutton Pulao", 400],
    ["Rice", "Fish Pulao", 400],
    ["Rice", "Prawns Pulao", 400],
    ["Rice", "Veg Biryani", 140],
    ["Rice", "Paneer Biryani", 220],
    ["Rice", "Mushroom Biryani", 300],
    ["Rice", "Egg Biryani", 100],
    ["Rice", "Chicken Biryani", 160],
    ["Rice", "Chicken 65 Biryani", 180],
    ["Rice", "Chicken Fry Piece Biryani", 250],
    ["Rice", "Chicken Boneless Biryani", 280],
    ["Rice", "Gongura Chicken Biryani", 250],
    ["Rice", "Ulavacharu Chicken Biryani", 270],
    ["Rice", "Avakai Chicken Biryani", 300],
    ["Rice", "Mutton Biryani", 180],
    ["Rice", "Gongura Mutton Biryani", 450],
    ["Rice", "Fish Biryani", 300],
    ["Rice", "Prawns Biryani", 300],
    ["Rice", "Nellore Chicken Biryani", 350],
    ["Rice", "Nellore Mutton Biryani", 450],
    ["Rice", "Chicken Ghee Roast Biryani", 350],
    ["Rice", "Kaju Tomato Biryani", 300],
    ["Rice", "Stuffed Brinjal Biryani", 300],

    // =========================
    // DESSERTS
    // =========================

    ["Cakes & Pastries", "Chocolate Cake", 120],
    ["Cakes & Pastries", "Black Forest Cake", 120],
    ["Cakes & Pastries", "Red Velvet Cake", 140],
    ["Cakes & Pastries", "Vanilla Cake", 100],
    ["Cakes & Pastries", "Butterscotch Cake", 120],
    ["Cakes & Pastries", "Pineapple Cake", 110],
    ["Cakes & Pastries", "Chocolate Truffle Cake", 150],
    ["Cakes & Pastries", "Dutch Chocolate Cake", 160],
    ["Cakes & Pastries", "Ferrero Rocher Cake", 180],
    ["Cakes & Pastries", "Red Velvet Pastry", 100],
    ["Cakes & Pastries", "Chocolate Pastry", 90],
    ["Cakes & Pastries", "Black Forest Pastry", 90],
    ["Cakes & Pastries", "Pineapple Pastry", 80],
    ["Cakes & Pastries", "Butterscotch Pastry", 90],
    ["Cakes & Pastries", "Vanilla Pastry", 80],

    ["Brownies", "Classic Brownie", 100],
    ["Brownies", "Chocolate Brownie", 110],
    ["Brownies", "Walnut Brownie", 120],
    ["Brownies", "Fudge Brownie", 130],
    ["Brownies", "Nutella Brownie", 150],
    ["Brownies", "Oreo Brownie", 140],
    ["Brownies", "Brownie with Ice Cream", 180],
    ["Brownies", "Sizzling Brownie", 220],

    ["Ice Cream & Sundaes", "Vanilla Ice Cream", 70],
    ["Ice Cream & Sundaes", "Chocolate Ice Cream", 80],
    ["Ice Cream & Sundaes", "Strawberry Ice Cream", 80],
    ["Ice Cream & Sundaes", "Butterscotch Ice Cream", 90],
    ["Ice Cream & Sundaes", "Mango Ice Cream", 80],
    ["Ice Cream & Sundaes", "Chocolate Sundae", 130],
    ["Ice Cream & Sundaes", "Brownie Sundae", 180],
    ["Ice Cream & Sundaes", "Fruit Sundae", 150],
    ["Ice Cream & Sundaes", "Nutella Sundae", 180],
    ["Ice Cream & Sundaes", "Oreo Sundae", 170],
    ["Ice Cream & Sundaes", "Triple Chocolate Sundae", 200],

    ["Waffles", "Classic Waffle", 120],
    ["Waffles", "Chocolate Waffle", 140],
    ["Waffles", "Nutella Waffle", 160],
    ["Waffles", "Oreo Waffle", 160],
    ["Waffles", "Belgian Chocolate Waffle", 180],
    ["Waffles", "Strawberry Waffle", 170],
    ["Waffles", "Banana Chocolate Waffle", 170],
    ["Waffles", "KitKat Waffle", 180],
    ["Waffles", "Biscoff Waffle", 190],
    ["Waffles", "Brownie Waffle", 200],

    ["Pancakes", "Classic Pancakes", 120],
    ["Pancakes", "Chocolate Pancakes", 140],
    ["Pancakes", "Banana Pancakes", 150],
    ["Pancakes", "Strawberry Pancakes", 160],
    ["Pancakes", "Nutella Pancakes", 170],
    ["Pancakes", "Oreo Pancakes", 170],
    ["Pancakes", "Biscoff Pancakes", 190],
    ["Pancakes", "Chocolate Chip Pancakes", 160],

    ["Puddings & Cups", "Caramel Custard", 90],
    ["Puddings & Cups", "Chocolate Pudding", 110],
    ["Puddings & Cups", "Bread Pudding", 100],
    ["Puddings & Cups", "Rice Pudding", 90],
    ["Puddings & Cups", "Fruit Custard", 100],
    ["Puddings & Cups", "Chocolate Mousse", 130],
    ["Puddings & Cups", "Mango Mousse", 130],
    ["Puddings & Cups", "Strawberry Mousse", 130],
    ["Puddings & Cups", "Oreo Mousse Cup", 140],
    ["Puddings & Cups", "Chocolate Dessert Cup", 150],

    ["Cheesecakes", "Classic Cheesecake", 180],
    ["Cheesecakes", "New York Cheesecake", 220],
    ["Cheesecakes", "Blueberry Cheesecake", 240],
    ["Cheesecakes", "Strawberry Cheesecake", 220],
    ["Cheesecakes", "Chocolate Cheesecake", 230],
    ["Cheesecakes", "Oreo Cheesecake", 220],
    ["Cheesecakes", "Biscoff Cheesecake", 250],
    ["Cheesecakes", "Mango Cheesecake", 220],
    ["Cheesecakes", "Lotus Biscoff Cheesecake", 250],
    ["Cheesecakes", "Gulab Jamun Cheesecake", 260],

    ["Special Desserts", "Tiramisu", 250],
    ["Special Desserts", "Tres Leches", 220],
    ["Special Desserts", "Panna Cotta", 180],
    ["Special Desserts", "Crème Brûlée", 220],
    ["Special Desserts", "Chocolate Lava Cake", 180],
    ["Special Desserts", "Molten Chocolate Cake", 200],
    ["Special Desserts", "Affogato", 180],
    ["Special Desserts", "Apple Pie", 180],
    ["Special Desserts", "Chocolate Tart", 190],
    ["Special Desserts", "Fruit Tart", 180],

    ["Donuts & Churros", "Glazed Donut", 60],
    ["Donuts & Churros", "Chocolate Donut", 70],
    ["Donuts & Churros", "Strawberry Donut", 70],
    ["Donuts & Churros", "Oreo Donut", 80],
    ["Donuts & Churros", "Nutella Donut", 90],
    ["Donuts & Churros", "Biscoff Donut", 100],
    ["Donuts & Churros", "Churros", 100],
    ["Donuts & Churros", "Chocolate Churros", 120],
    ["Donuts & Churros", "Churros with Chocolate Dip", 140],
    ["Donuts & Churros", "Churros with Ice Cream", 170],

    ["Bakery Desserts", "Chocolate Muffin", 80],
    ["Bakery Desserts", "Blueberry Muffin", 90],
    ["Bakery Desserts", "Banana Muffin", 80],
    ["Bakery Desserts", "Chocolate Chip Cookie", 60],
    ["Bakery Desserts", "Double Chocolate Cookie", 70],
    ["Bakery Desserts", "Red Velvet Cookie", 80],
    ["Bakery Desserts", "Brownie Cookie", 90],
    ["Bakery Desserts", "Chocolate Croissant", 120],
    ["Bakery Desserts", "Cinnamon Roll", 120],
    ["Bakery Desserts", "Chocolate Eclair", 100],

    ["Indian Desserts", "Gulab Jamun", 60],
    ["Indian Desserts", "Rasmalai", 90],
    ["Indian Desserts", "Rasgulla", 70],
    ["Indian Desserts", "Kaju Katli", 100],
    ["Indian Desserts", "Jalebi with Rabri", 120],
    ["Indian Desserts", "Gajar Ka Halwa", 100],
    ["Indian Desserts", "Shahi Tukda", 120],
    ["Indian Desserts", "Double Ka Meetha", 120],
    ["Indian Desserts", "Qubani Ka Meetha", 130],
    ["Indian Desserts", "Kulfi", 90],
    ["Indian Desserts", "Falooda", 150],
    ["Indian Desserts", "Rabri", 100],

    ["Special / Premium Desserts", "Dubai Chocolate", 250],
    ["Special / Premium Desserts", "Dubai Kunafa", 280],
    ["Special / Premium Desserts", "Chocolate Kunafa", 220],
    ["Special / Premium Desserts", "Pistachio Kunafa", 250],
    ["Special / Premium Desserts", "Kunafa Cheesecake", 280],
    ["Special / Premium Desserts", "Ferrero Rocher Dessert", 250],
    ["Special / Premium Desserts", "Kinder Joy Dessert Cup", 220],
    ["Special / Premium Desserts", "Nutella Dessert Jar", 200],
    ["Special / Premium Desserts", "Biscoff Dessert Jar", 220],
    ["Special / Premium Desserts", "Chocolate Truffle Jar", 200],
    ["Special / Premium Desserts", "Red Velvet Jar", 190],
    ["Special / Premium Desserts", "Mixed Dessert Platter", 399]
];

const insert = db.prepare(`
    INSERT INTO foods
    (name, category, price, description, image, available)
    VALUES (?, ?, ?, ?, ?, 1)
`);

for (const food of foods) {
    insert.run(
        food[1],
        food[0],
        food[2],
        `Delicious ${food[1]} prepared fresh for you.`,
        ""
    );
}

console.log("=================================");
console.log("Remaining menu added successfully");
console.log("Items added:", foods.length);
console.log("=================================");

db.close();