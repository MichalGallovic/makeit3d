<h4>{{ $order->first_name }} your Order:#{{ $order->id }} has been created!</h4>
<h6>Order details:</h6>
<table>
<thead>
    <tr>
        <th>Model name</th><th>Price</th>
    </tr>
</thead>
<tbody>
@foreach($order->models() as $model)
    <tr>
        <td>{{ $model->name }}</td><td>{{ $model->price }}</td>
    </tr>
@endforeach
<h6>Total price: {{ $order->price }}</h6>
<p>Your order is being processed at the moment. We will let you know as soon as possible, when it will be completed!</p>
</tbody>
</table>
