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
    const { message, message_id } = await req.json();

    if ( !message )
    {
      console.error( `[${ reqId }] thiếu msg` );
      return NextResponse.json( { success: false }, { status: 400 } );
    }

    const isEdit = !!message_id;
    const method = isEdit ? 'editMessageText' : 'sendMessage';
    const url = `https://api.telegram.org/bot${ CONFIG.TOKEN }/${ method }`;

    const res = await fetch( url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( {
        chat_id: CONFIG.CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        ...( isEdit && { message_id } )
      } ),
    } );

    const data = await res.json();

    if ( !res.ok )
    {
      console.error( `[${ reqId }] tg api lỗi:`, data.description );
      throw new Error( data.description || 'api err' );
    }

    return NextResponse.json( {
      success: true,
      message_id: data.result?.message_id ?? message_id
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
