import { Link } from "react-router-dom";
import ProductModel from "../../Models/ProductModel";
import { AnyNsRecord } from "dns";

export const CheckoutAndReviewBox: React.FC<{ product: ProductModel | undefined, mobile: boolean,currentLoansCount:number,isAuthenticated:any,isCheckedOut:boolean,checkoutProduct:any }> = (props) => {
    function buttonRender(){
        if(props.isAuthenticated){
            if(!props.isCheckedOut && props.currentLoansCount<5){
                return (<button onClick={()=>props.checkoutProduct()}className="btn btn-success btn-lg">Checkout</button>)
            }
            else if(props.isCheckedOut){
                return(<p><b>Art checked out. Enjoy!</b></p>)
            }else if(!props.isCheckedOut){
                return(<p className="text-danger">Too many arts checked out.</p>)
            }
        }
        return(<Link to={'/login'} className="btn btn-success btn-lg">Sign In</Link>)
       }
    return (
        <div className={props.mobile ? 'card d-flex mt-5' : 'card col-3 container d-flex mb-5'}>
            <div className='card-body container'>
                <div className='mt-3'>
                    <p>
                        <b>{props.currentLoansCount}/5 </b>
                        products checked out
                    </p>
                    <hr />
                    {props.product && props.product.quantityAvailable && props.product.quantityAvailable> 0 ?
                        <h4 className='text-success'>
                            Available
                        </h4>
                        :
                        <h4 className='text-danger'>
                            Wait List
                        </h4>
                    }
                    <div className='row'>
                        <p className='col-6 lead'>
                            <b>{props.product?.quantities} </b>
                            Quantities
                        </p>
                        <p className='col-6 lead'>
                            <b>{props.product?.quantityAvailable} </b>
                            Available
                        </p>
                    </div>
                </div>
                {buttonRender()}
                <hr />
                <p className='mt-3'>
                    This number can change until placing order has been complete.
                </p>
                <p>
                    Sign in to be able to leave a review.
                </p>
            </div>
        </div>
    );
}
