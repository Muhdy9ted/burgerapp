import React, { Component } from 'react';
import { connect } from 'react-redux';

import Auxx from '../../hoc/Auxx';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner'
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';


// const INGREDIENT_PRICES = {
//     salad: 0.5,
//     cheese: 0.4,
//     meat: 1.3,
//     bacon: 0.7
// };

class BurgerBuilder extends Component {

    state = {
        // ingredients: null,
        // totalPrice: 4,
        // purchasable: false,
        purchasing: false,
        // Loading: false, 
        // error: false
    }

    componentDidMount() {
        this.props.onInitIngredients();
        // axios.get('https://react-burgerapp-de7d1-default-rtdb.firebaseio.com/ingredients.json').then(response => {
        //     this.setState({...this.state, ingredients: response.data})}).catch(error => {
        //         this.setState({...this.state, error: true});
        //     });
    }

    // updatePurchaseState (ingredients) {
    //     const sum = Object.keys( ingredients )
    //         .map( igKey => {
    //             return ingredients[igKey];
    //         } )
    //         .reduce( ( sum, el ) => {
    //             return sum + el;
    //         }, 0 );
    //     this.setState( { purchasable: sum > 0 } );
    // }

    updatePurchaseState (ingredients) {
        const sum = Object.keys( ingredients )
            .map( igKey => {
                return ingredients[igKey];
            } )
            .reduce( ( sum, el ) => {
                return sum + el;
            }, 0 );
        return sum > 0;
    }

    // addIngredientHandler = ( type ) => {
    //     const oldCount = this.state.ingredients[type];
    //     const updatedCount = oldCount + 1;
    //     const updatedIngredients = {
    //         ...this.state.ingredients
    //     };
    //     updatedIngredients[type] = updatedCount;
    //     const priceAddition = INGREDIENT_PRICES[type];
    //     const oldPrice = this.state.totalPrice;
    //     const newPrice = oldPrice + priceAddition;
    //     this.setState( { totalPrice: newPrice, ingredients: updatedIngredients } );
    //     this.updatePurchaseState(updatedIngredients);
    // }

    // removeIngredientHandler = ( type ) => {
    //     const oldCount = this.state.ingredients[type];
    //     if ( oldCount <= 0 ) {
    //         return;
    //     }
    //     const updatedCount = oldCount - 1;
    //     const updatedIngredients = {
    //         ...this.state.ingredients
    //     };
    //     updatedIngredients[type] = updatedCount;
    //     const priceDeduction = INGREDIENT_PRICES[type];
    //     const oldPrice = this.state.totalPrice;
    //     const newPrice = oldPrice - priceDeduction;
    //     this.setState( { totalPrice: newPrice, ingredients: updatedIngredients } );
    //     this.updatePurchaseState(updatedIngredients);
    // }

    purchaseHandler = () => {
        if(this.props.isAuthenticated){
            this.setState({purchasing: true});
        }else{
            this.props.onSetAuthRedirectPath('/checkout');
            this.props.history.push("/auth");
        }
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    // purchaseContinueHandler = () => {
    //     const queryParams = [];
    //     for (let i in this.state.ingredients){
    //         queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
    //     }
    //     queryParams.push(encodeURIComponent('price') + '=' + encodeURIComponent(this.state.totalPrice.toFixed(2)));
    //     console.log(queryParams);
    //     const queryString = queryParams.join('&');
    //     this.props.history.push({
    //         pathname: '/checkout',
    //         search: '?' + queryString
    //     });
    // }

    purchaseContinueHandler = () => {
        this.props.onInitPurchase();
        this.props.history.push('/checkout');
    }

    render () {
        const disabledInfo = {
            // ...this.state.ingredients
            ...this.props.ings
        };
        for ( let key in disabledInfo ) {
            disabledInfo[key] = disabledInfo[key] <= 0
        } // {salad: true, meat: false, ...}

        let orderSummary = null;

        let burger = this.props.error ? <p>Ingredients can't be loaded</p> : <Spinner />

        // if(this.state.ingredients){
            if(this.props.ings){
            burger = (
                <Auxx>
                    {/* <Burger ingredients={this.state.ingredients} /> */}
                    <Burger ingredients={this.props.ings} />
                    <BuildControls
                        // ingredientAdded={this.addIngredientHandler}
                        // ingredientRemoved={this.removeIngredientHandler}
                        ingredientAdded={this.props.onIngredientAdded}
                        ingredientRemoved={this.props.onIngredientRemoved}
                        disabled={disabledInfo}
                        // purchasable={this.state.purchasable}
                        purchasable={this.updatePurchaseState(this.props.ings)}
                        ordered = {this.purchaseHandler}
                        // price={this.state.totalPrice}
                        price={this.props.price}
                        isAuth={this.props.isAuthenticated}
                    />
                </Auxx>
            )

            orderSummary = (
                <OrderSummary 
                    // ingredients={this.state.ingredients} 
                    ingredients={this.props.ings} 
                    purchaseCancelled={this.purchaseCancelHandler} 
                    purchaseContinued={this.purchaseContinueHandler} 
                    // price={this.state.totalPrice}
                    price={this.props.price}
                />
            ) 

        }

        
        // if(this.state.Loading){
        //     orderSummary = <Spinner />;
        // }

        return (
            <Auxx>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler} > 
                    {orderSummary}
                </Modal>
                {burger}
            </Auxx>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null

    }
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (withErrorHandler(BurgerBuilder, axios));