import prisma from "@/app/libs/prismadb"

export interface IListingsParams {
    userId?: string;
    guestCount?:number;
    roomCount?:number;
    bathroomCount?:number;
    startDate?:string;
    endDate?:string;
    locationValue?:string;
    category?:string;
}


function shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



export default async function getListings( 
    params: IListingsParams
) {
    try {
        const { 
        userId,
        roomCount,
        guestCount,
        bathroomCount,
        locationValue,
        startDate,
        endDate,
        category
        } = params;

        let query: any = {};

        if(userId) {
            query.userId = userId;
        }

        if(category) {
            query.category = category
        }

        if(roomCount) {
            query.roomCount = {
                gte: +roomCount
            }
        }

        if(guestCount) {
            query.guestCount = {
                gte: +guestCount
            }
        }

        if(bathroomCount) {
            query.bathroomCount = {
                gte: +bathroomCount
            }
        }

        if(locationValue) {
            query.locationValue=locationValue;
        }

        if(startDate && endDate) {
            query.NOT = {
                reservations :{
                    some : {
                        OR:[
                        {  
                         endDate: {gte: startDate},
                         startDate: {lte: startDate}   
                        },
                        {
                            startDate: {lte: endDate},
                            endDate: {lte: endDate}
                        }
                        ]
                    }
                }
            }
        }


        const listings = await prisma.listing.findMany({
            where:query,
            
            orderBy: {
                createdAt:'desc'
            }
        })

        const shuffledListings = shuffleArray([...listings]);

        const safeListings = shuffledListings.map((listing:any) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
        }))

        return safeListings

    } catch(error: any) {
        throw new Error(error);
    }
}

