<p>Dear {{ $order->user->first_name }}, your order of {{ count(json_decode($order->models)->data) }} models has been shipped!</p>