import { useState,useEffect } from "react";
import ProductModel from "../../Models/ProductModel";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarsReview } from "../Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import ReviewModel from "../../Models/ReviewModel";
import { LatestReviews } from "./LatestReviews";
import { useOktaAuth } from "@okta/okta-react";
import { error } from "console";
export const ProductCheckoutPage=()=>{

    const{authState}=useOktaAuth();
    const [product,setProduct]=useState<ProductModel>();
    const [isLoading,setIsLoading]=useState(true);
    const [httpError,setHttpError]=useState(null);

    /*Review*/
    const[reviews,setReviews]=useState<ReviewModel[]>([]);
    const[totalStars,setTotalStars]=useState(0);
    const[isLoadingReview,setIsLoadingReview]=useState(true);

    /*Loans count state*/ 
    const[currentLoansCount,setCurrentLoansCount]=useState(0);
    const[isLoadingCurrentLoansCount,setIsLoadingCurrentLoansCount]=useState(true);
    const productId=(window.location.pathname).split('/')[2];


    /*Is Product Check Out?*/
    const [isCheckedOut,setIsCheckedOut]=useState(false);
    const [isLoadingProductCheckedOut,setIsLoadingProductCheckedOut]=useState(true);
    useEffect(() => {
        const fetchProduct= async () => {
            const baseUrl: string = `http://localhost:8081/products/${productId}`;

            const response = await fetch(baseUrl);

            if (!response.ok) {
                throw new Error('Something went wrong!');
            }
            const responseJson = await response.json();

            const loadedProduct: ProductModel = {
                productId: responseJson.productId,
                title: responseJson.title,
                artist: responseJson.artist,
                productDescription: responseJson.productDescription,
                quantities: responseJson.quantities,
                quantityAvailable: responseJson.quantityAvailable,
                category: responseJson.category,
                image: responseJson.image,
            };
            setProduct(loadedProduct);
            setIsLoading(false);
        };
        fetchProduct().catch((error: any) => {
            setIsLoading(false);
            setHttpError(error.message);
        })
    }, [isCheckedOut]);

    useEffect(()=>{
        const fetchProductReviews=async()=>{
            const reviewUrl: string =`http://localhost:8081/reviews/search/findByProductId?productId=${productId}`;
            const responseReviews=await fetch(reviewUrl);
            if(!responseReviews.ok){
                throw new Error('Something went wrong');
            }
            const responseJsonReviews=await responseReviews.json();
            const responseData= responseJsonReviews._embedded.reviews;
            const loadedReviews: ReviewModel[]=[];
            let weightedStarReviews:number=0;
            for (const key in responseData){
                loadedReviews.push({
                    reviewId: responseData[key].reviewId,
                    userEmail:responseData[key].userEmail,
                    date: responseData[key].date,
                    rating: responseData[key].rating,
                    productId: responseData[key].productId,
                    reviewDescription: responseData[key].reviewDescription,

            });
            weightedStarReviews=weightedStarReviews+responseData[key].rating;
            }
            if(loadedReviews){
                const round=(Math.round((weightedStarReviews/ loadedReviews.length)*2)/2).toFixed(1);
                setTotalStars(Number(round));
            }
            setReviews(loadedReviews);
            setIsLoadingReview(false);
        };

        fetchProductReviews().catch((error: any)=>{
            setIsLoadingReview(false);
            setHttpError(error.message);
        })
    },[]);

    useEffect(()=>{
       const fetchUserCurrentLoansCount=async()=>{
            if(authState && authState.isAuthenticated){
                const url=`http://localhost:8081/products/secure/currentloans/count`;
                const requestOptions={
                    method:'GET',
                    header:{
                        Authorization:`Bearer ${authState.accessToken?.accessToken}`,'Content-type':'application/json'
                    }
                };
                const currentLoansCountResponse=await fetch(url,requestOptions);
                if(!currentLoansCountResponse.ok){
                    throw new Error('Something went wrong!');
                }
                const currentLoansCountResponseJson=await currentLoansCountResponse.json();
                setCurrentLoansCount(currentLoansCountResponseJson);
            }
            setIsLoadingCurrentLoansCount(false);

       }
       fetchUserCurrentLoansCount().catch((error: any)=>{
        setIsLoadingCurrentLoansCount(false);
        setHttpError(error.message);
       })
    },[authState,isCheckedOut]);

    useEffect(()=>{

        const fetchUserCheckedOutProduct=async()=>{
            if(authState && authState.isAuthenticated){
                const url=`http://localhost:8081/products/secure/ischeckedout/byuser/?productId=${productId}`;
                const requestOptions={
                    method:'GET',
                    header:{
                        Authorization:`Bearer ${authState.accessToken?.accessToken}`,'Content-type':'application/json'
                    }
                };
                const productCheckedOut=await fetch(url,requestOptions);
                if(!productCheckedOut.ok){
                    throw new Error('Something went wrong!');
                }
                const productCheckedOutResponseJson=await productCheckedOut.json();
                setIsCheckedOut(productCheckedOutResponseJson);
            }
            setIsLoadingProductCheckedOut(false);

        }
        fetchUserCheckedOutProduct().catch((error: any)=>{
            setIsLoadingProductCheckedOut(false);
            setHttpError(error.message);})
    },[authState]);

    if (isLoading || isLoadingReview || isLoadingCurrentLoansCount ||isLoadingProductCheckedOut) {
        return (
            <SpinnerLoading/>
        )
    }

    if (httpError) {
        return (
            <div className='container m-5'>
                <p>{httpError}</p>
            </div>
        )
    }

    async function checkoutProduct(){
        const url=`http://localhost:8081/products/secure/checkout/?productId=${product?.productId}`;
        const requestOptions={
            method:'PUT',
            headers:{
                Authorization:`Bearer ${authState?.accessToken?.accessToken}`,
                'Content-Type':'application/json'
            }
        };
        const checkoutResponse=await fetch(url,requestOptions);
        if(!checkoutResponse.ok){
            throw new Error('Something went wrong!');
        }
        setIsCheckedOut(true);
    }
    return(
        <div>
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2 col-md-2">
                        {product?.image?
                        <img src={product?.image}width='226' height='349' alt='Art'/>
                        :
                        <img src={require('./../../Images/ArtImages/AutumnPathWay.jpeg')} width='226' height='349' alt='Art'/>
                         }
                    </div>
                    <div className="col-4 col-md-4 container">
                        <div className="ml-2">
                            <h2>{product?.title}</h2>
                            <h5 className="text-primary">{product?.artist}</h5>
                            <p className="lead">{product?.productDescription}</p>
                            <StarsReview rating={totalStars} size={32}/>
                        </div>
                    </div>
                    <CheckoutAndReviewBox product={product} mobile={false} currentLoansCount={currentLoansCount} isAuthenticated={authState?.isAuthenticated} isCheckedOut={isCheckedOut} checkoutProduct={checkoutProduct}/>
                    
                </div>
                <hr/>
                <LatestReviews reviews={reviews} productId={product?.productId} mobile={false}/>
            </div>
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center align-itams-center">
                {product?.image?
                        <img src={product?.image}width='226' height='349' alt='Art'/>
                        :
                        <img src={require('./../../Images/ArtImages/AutumnPathWay.jpeg')} width='226' height='349' alt='Art'/>
                         }
                </div>
                <div className="mt-4">
                    <div className="ml-2">
                    <h2>{product?.title}</h2>
                            <h5 className="text-primary">{product?.artist}</h5>
                            <p className="lead">{product?.productDescription}</p>
                            <StarsReview rating={totalStars} size={32}/>
                    </div>
                </div>
                <CheckoutAndReviewBox product={product} mobile={true} currentLoansCount={currentLoansCount} isAuthenticated={authState?.isAuthenticated} isCheckedOut={isCheckedOut}checkoutProduct={checkoutProduct}/>
                <hr/>
                <LatestReviews reviews={reviews} productId={product?.productId} mobile={false}/>
            </div>
        </div>
    );
}