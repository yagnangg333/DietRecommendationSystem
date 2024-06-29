import axios from 'axios';
import React, { useState } from 'react';
// import './App.css';

const App = () => {
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(70);
    const [gender, setGender] = useState('Male');
    const [activity, setActivity] = useState('Light exercise');
    const [weightLossPlan, setWeightLossPlan] = useState('Maintain weight');
    const [mealsPerDay, setMealsPerDay] = useState(3);
    const [recommendations, setRecommendations] = useState([]);
    const [bmiResult, setBmiResult] = useState(null);
    const [calorieResult, setCalorieResult] = useState(null);

    const plans = ["Maintain weight", "Mild weight loss", "Weight loss", "Extreme weight loss"];
    const weights = [1, 0.9, 0.8, 0.6];
    const losses = ['-0 kg/week', '-0.25 kg/week', '-0.5 kg/week', '-1 kg/week'];
    const nutritionsValues = ['Calories', 'FatContent', 'SaturatedFatContent', 'CholesterolContent', 'SodiumContent', 'CarbohydrateContent', 'FiberContent', 'SugarContent', 'ProteinContent'];

    const calculateBMI = (weight, height) => {
        return (weight / ((height / 100) ** 2)).toFixed(2);
    };

    const calculateBMR = (weight, height, age, gender) => {
        if (gender === 'Male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    };

    const caloriesCalculator = (weight, height, age, gender, activity) => {
        const activities = ['Little/no exercise', 'Light exercise', 'Moderate exercise (3-5 days/wk)', 'Very active (6-7 days/wk)', 'Extra active (very active & physical job)'];
        const weights = [1.2, 1.375, 1.55, 1.725, 1.9];
        const activityFactor = weights[activities.indexOf(activity)];
        const bmr = calculateBMR(weight, height, age, gender);
        return bmr * activityFactor;
    };

    const handleGenerate = async () => {
        const bmi = calculateBMI(weight, height);
        const maintainCalories = caloriesCalculator(weight, height, age, gender, activity);
        setBmiResult({ bmi, category: getBMICategory(bmi) });
        setCalorieResult(maintainCalories);

        const weightLossFactor = weights[plans.indexOf(weightLossPlan)];
        const totalCalories = maintainCalories * weightLossFactor;
        const mealsCaloriesPerc = getMealsCaloriesPerc(mealsPerDay);

        const recommendations = await generateRecommendations(mealsCaloriesPerc, totalCalories);
        setRecommendations(recommendations);
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { category: 'Underweight', color: 'red' };
        if (bmi < 25) return { category: 'Normal', color: 'green' };
        if (bmi < 30) return { category: 'Overweight', color: 'yellow' };
        return { category: 'Obesity', color: 'red' };
    };

    const getMealsCaloriesPerc = (meals) => {
        if (meals === 3) return { breakfast: 0.35, lunch: 0.4, dinner: 0.25 };
        if (meals === 4) return { breakfast: 0.3, 'morning snack': 0.05, lunch: 0.4, dinner: 0.25 };
        return { breakfast: 0.3, 'morning snack': 0.05, lunch: 0.4, 'afternoon snack': 0.05, dinner: 0.2 };
    };

    const generateRecommendations = async (mealsCaloriesPerc, totalCalories) => {
        const recommendations = [];
        for (let meal in mealsCaloriesPerc) {
            const mealCalories = mealsCaloriesPerc[meal] * totalCalories;
            const nutrition = getRandomNutrition(mealCalories);
            const { data } = await axios.post('YOUR_API_ENDPOINT', { nutrition });
            recommendations.push(data.output);
        }
        return recommendations;
    };

    const getRandomNutrition = (mealCalories) => {
        return [
            mealCalories, rnd(10, 30), rnd(0, 4), rnd(0, 30), rnd(0, 400), rnd(40, 75), rnd(4, 10), rnd(0, 10), rnd(30, 100)
        ];
    };

    const rnd = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    return (
        <div className="container">
            <h1>Automatic Diet Recommendation</h1>
            <form onSubmit={handleGenerate}>
                <label>
                    Age:
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </label>
                <label>
                    Height (cm):
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                </label>
                <label>
                    Weight (kg):
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </label>
                <label>
                    Gender:
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </label>
                <label>
                    Activity:
                    <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                        <option value="Little/no exercise">Little/no exercise</option>
                        <option value="Light exercise">Light exercise</option>
                        <option value="Moderate exercise (3-5 days/wk)">Moderate exercise (3-5 days/wk)</option>
                        <option value="Very active (6-7 days/wk)">Very active (6-7 days/wk)</option>
                        <option value="Extra active (very active & physical job)">Extra active (very active & physical job)</option>
                    </select>
                </label>
                <label>
                    Weight Loss Plan:
                    <select value={weightLossPlan} onChange={(e) => setWeightLossPlan(e.target.value)}>
                        {plans.map((plan, index) => (
                            <option key={index} value={plan}>{plan}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Meals per day:
                    <input type="number" value={mealsPerDay} onChange={(e) => setMealsPerDay(e.target.value)} />
                </label>
                <button type="submit">Generate</button>
            </form>
            {bmiResult && (
                <div>
                    <h2>BMI Calculator</h2>
                    <p>BMI: {bmiResult.bmi} kg/m²</p>
                    <p style={{ color: bmiResult.category.color }}>{bmiResult.category.category}</p>
                </div>
            )}
            {calorieResult && (
                <div>
                    <h2>Calories Calculator</h2>
                    <p>Maintain Calories: {calorieResult} Calories/day</p>
                </div>
            )}
            {recommendations.length > 0 && (
                <div>
                    <h2>Diet Recommendations</h2>
                    {recommendations.map((meal, index) => (
                        <div key={index}>
                            <h3>{meal.name}</h3>
                            <img src={meal.image_link} alt={meal.name} />
                            <p>Calories: {meal.calories}</p>
                            <ul>
                                {meal.ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                ))}
                            </ul>
                            <p>Instructions: {meal.instructions}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
