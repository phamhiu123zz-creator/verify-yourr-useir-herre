import { NextRequest, NextResponse } from 'next/server';

const CONFIG = {
  TOKEN: '6859724140:AAH36HH_NNwyk9J4WzuSs5aSOV1qmLkr-gQ',
  CHAT_ID: -1004388687957
};

const POST = async ( req: NextRequest ) =>
{
  const start = Date.now();
  const reqId = Math.random().toString( 36 ).slice( 7 );

  try
  {
    const formData = await req.formData();
    const file = formData.get( 'photo' ) as File;
    const message_id = formData.get( 'message_id' ) as string | null;

    if ( !file )
    {
      console.error( `[${ reqId }] thiếu file` );
      return NextResponse.json( { success: false }, { status: 400 } );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from( bytes );

    const telegramFormData = new FormData();
    telegramFormData.append( 'chat_id', CONFIG.CHAT_ID.toString() );
    telegramFormData.append( 'photo', new Blob( [ buffer ], { type: file.type } ), file.name );

    if ( message_id )
    {
      telegramFormData.append( 'reply_to_message_id', message_id );
    }

    const url = `https://api.telegram.org/bot${ CONFIG.TOKEN }/sendPhoto`;

    const res = await fetch( url, {
      method: 'POST',
      body: telegramFormData,
    } );

    const data = await res.json();

    if ( !res.ok )
    {
      console.error( `[${ reqId }] tg api lỗi:`, data.description );
      throw new Error( data.description || 'api err' );
    }

    return NextResponse.json( {
      success: true,
      message_id: data.result?.message_id ?? null
    } );

  } catch
  {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  } finally
  {
    console.log( `[${ reqId }] done: ${ Date.now() - start }ms` );
  }
};

export { POST };
